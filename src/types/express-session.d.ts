// src/types/express-session.d.ts
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string;
            login: string;
            firstName: string;
            lastName: string;
        };
        userId?: string;
    }
}

declare module 'express' {
    interface Request {
        session: Session & Partial<SessionData>;
    }
}