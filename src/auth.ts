import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { getUserByEmail } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new InvalidCredentialsError();
        }

        const user = await getUserByEmail(parsed.data.email);

        if (!user) {
          throw new InvalidCredentialsError();
        }

        const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!passwordValid) {
          throw new InvalidCredentialsError();
        }

        if (!user.emailVerifiedAt) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
