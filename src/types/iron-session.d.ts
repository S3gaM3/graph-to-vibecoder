import type { SessionPayload } from "@/lib/session";

declare module "iron-session" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation marker only
  interface IronSessionData extends SessionPayload {}
}
