import "next-auth";
import "next-auth/jwt";

interface UserSessionData {
    default_daily_reminders_in_mins?: number;
    sound_alerts?: boolean;
    email_reminders?: boolean;
    push_notification?: boolean;
}
declare module "next-auth" {
    interface Session {
        user:  DefaultSession["user"] & UserSessionData;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sessionData?: UserSessionData,
    }
}