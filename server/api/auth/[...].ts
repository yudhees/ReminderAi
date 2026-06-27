import { NuxtAuthHandler } from '#auth'
import { User } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import UserService from '~~/server/service/UserService';
import merge from "lodash/merge.js"
import pick from "lodash/pick.js"
export default NuxtAuthHandler({
    secret: process.env.AUTH_SECRET,

    providers: [
        // @ts-ignore
        GoogleProvider.default({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
    ],
    callbacks: {
        /* on before signin */
        async signIn({ user, account, profile, email, credentials }) {
            if(user){
                const userService=new UserService()
                await userService.authenticaeUser(user as Required<User>);
            }
            return true
        },
        /* on redirect to another url */
        async redirect({ url, baseUrl }) {
            return baseUrl
        },
        /* on session retrival */
        async session({ session, user, token }) {                          
            merge(session.user,{...(token.sessionData??{})})
            return session
        },
        /* on JWT token creation or mutation */
        async jwt({ token, user, account, profile, isNewUser }) {
            if(token?.email){
                const userService=new UserService()
                const authUser=await userService.user(token.email)
                if(!authUser)return {};
                token.sessionData=pick(authUser,['default_daily_reminders_in_mins','sound_alerts','email_reminders','push_notification'])
            }
            return token
        }
    }

})