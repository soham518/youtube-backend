import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudnary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudnary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    discription: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, //from cloudnary url
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      tupe: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);
//helps in mongoose aggregation pipeline.
export const Video = mongoose.model("Video", videoSchema);
