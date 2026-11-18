import { createHash, timingSafeEqual } from "node:crypto";
import { LIMITS } from "./config.js";

// Limites em memória: valem por instância da função (melhor esforço, não é uma garantia global).
const pinFails = new Map(); // ip -> { count, resetAt }
const generations = new Map(); // ip -> number[] (timestamps)

const sha = (s) => createHash("sha256").update(String(s)).digest();

export function pinIsValid(pin) {
  const expected = process.env.APP_PIN;
  if (!expected || typeof pin !== "string" || !pin) return false;
  return timingSafeEqual(sha(pin), sha(expected));
}

export function isBlocked(ip, now = Date.now()) {
  const r = pinFails.get(ip);
  if (!r) return false;
  if (now > r.resetAt) {
    pinFails.delete(ip);
    return false;
  }
  return r.count >= LIMITS.maxPinFails;
}

export function registerFailure(ip, now = Date.now()) {
  const r = pinFails.get(ip);
  if (!r || now > r.resetAt) pinFails.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
  else r.count += 1;
}

export function clearFailures(ip) {
  pinFails.delete(ip);
}

export function generationAllowed(ip, now = Date.now()) {
  const list = (generations.get(ip) || []).filter((t) => now - t < 3_600_000);
  generations.set(ip, list);
  return list.length < LIMITS.maxGenerationsPerHour;
}

export function registerGeneration(ip, now = Date.now()) {
  const list = generations.get(ip) || [];
  list.push(now);
  generations.set(ip, list);
}

// Valida o PIN do corpo da requisição. Devolve null se OK, ou { status, error }.
export function checkAuth(ip, pin) {
  if (!process.env.APP_PIN) return { status: 500, error: "APP_PIN não configurado no servidor." };
  if (isBlocked(ip)) return { status: 429, error: "Muitas tentativas. Aguarde alguns minutos." };
  if (!pinIsValid(pin)) {
    registerFailure(ip);
    return { status: 401, error: "Código PIN incorreto." };
  }
  clearFailures(ip);
  return null;
}

export function _resetForTests() {
  pinFails.clear();
  generations.clear();
}
