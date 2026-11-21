import type {PipelineStage} from "mongoose" 
export class RemindersService{
    /**
     * Reminders grouped by day in the user's timezone.
     * filters.view: 'upcoming' | 'recurring' | 'done' | anything else = all
     */
    async reminders(userId:string,filters:Record<string,any>){
        const match:Record<string,any>={
            userId,
            remind_time:{$ne:null}
        }
        if(filters.view=='upcoming'){
            match.remind_time={$gte:new Date()}
            match.notification_sent={$ne:true}
        }else if(filters.view=='recurring'){
            match.recurrence={$nin:[null,'none']}
        }else if(filters.view=='done'){
            match.notification_sent=true
        }
        const stages:PipelineStage[]=[]
        stages.push({ $match: match })
        stages.push({
            $addFields:{
                remind_date:{ $dateToString:{ format:"%Y-%m-%d", date:"$remind_time", timezone:filters.timezone || "UTC" } }
            }
        })
        stages.push({
            $sort:{ remind_time:1 }
        })
        stages.push({
            $project:{
                remind_date:1,
                remind_time:1,
                heading:1,
                recurrence:1,
                notification_sent:1,
                _id:{ $toString:"$_id" }
            }
        })
        stages.push({
            $group:{
                _id:"$remind_date",
                reminders:{ $push:{ _id:"$_id", heading:"$heading", remind_time:"$remind_time", recurrence:"$recurrence", notification_sent:"$notification_sent" } }
            }
        })
        stages.push({ $sort:{ _id:1 } })
        const res =await ChatSession.aggregate(stages)
        return res
   }
}
