import type {PipelineStage} from "mongoose" 
export class RemindersService{
    async reminders(userId:string,filters:Record<string,any>){
        const match={
            userId,
            remind_time:{$ne:null}
        }
        const stages:PipelineStage[]=[]
        stages.push({ $match: match })
        stages.push({
            $addFields:{
                remind_date:{ $dateToString:{ format:"%Y-%m-%d", date:"$remind_time", timezone:filters.timezone } }
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
                _id:{ $toString:"$_id" }
            }
        })
        stages.push({
            $group:{
                _id:"$remind_date",
                reminders:{ $push:{ _id:"$_id", heading:"$heading", remind_time:"$remind_time" } }
            }
        })
        stages.push({ $sort:{ _id:1 } })
        const res =await ChatSession.aggregate(stages)
        return res
   }
}