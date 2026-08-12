

export default class {
    async getChats(userId:string,page:number,limit:number) {
        const sessions = await ChatSession.aggregate([
            {$match:{
                userId,
            }},
            {$sort:{
                created_at:-1
            }},
            {$skip:(page-1)*limit},
            {$limit:limit+1},
            {$project:{
                heading:1,remind_time:1,

            }}
        ])
        const hasMorePages=Boolean(sessions.at(limit))
        delete sessions[limit]
        const results=sessions.map(session=>{
            return {
                id:String(session._id),
                heading:session.heading,
                remind_time:session.remind_time
            }
        })
        return {results,hasMorePages}
    }
}