/**
 * app/(auth)/layout.tsx — Layout du groupe d'authentification
 *
 * Rôle : enveloppe toutes les pages auth (/login, /register, /forgot-password).
 * - Le groupe (auth) ne crée PAS de segment d'URL supplémentaire.
 * - Ce layout n'ajoute pas de navigation ni de sidebar : les pages auth
 *   sont intentionnellement isolées du reste de l'interface.
 * - Idéal pour injecter un Provider spécifique à l'auth (ex: ReCaptcha).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
