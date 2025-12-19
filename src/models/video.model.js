import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // ye plugin humne isliye install kiya taki hum apne video model m pagination use kr ske jaise watch history h toh usme toh bhot saari id video id hogi toh

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true,
        },
        thumbnail: {
            type: String, // cloudinary url
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // in seconds
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
         owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }

    },
    {
        timestamps : true
    }
)
videoSchema.plugin(mongooseAggregatePaginate); // ye plugin use krne k liye hmne schema m plugin method use kiya

export const Video = mongoose.model("Video", videoSchema);