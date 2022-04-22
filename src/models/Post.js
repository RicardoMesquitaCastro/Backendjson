const mongoose = require("mongoose"); //servidor
const aws = require("aws-sdk"); //servidor
const fs = require("fs"); //local
const path = require("path"); //local
const { promisify } = require("util"); //local

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PostSchema.pre("save", function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

PostSchema.pre("remove", function() { //quando o usuario excluir uma imagem também excluirá no s3
  if (process.env.STORAGE_TYPE === "s3") {
    return s3
      .deleteObject({
        bucket: "uploadbrasa2",
        Key: this.key
      })
      .promise()
      .then(response => {
        console.log(response.status);
      })
      .catch(response => {
        console.log(response.status);
      });
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
    );
  }
});

module.exports = mongoose.model("Post", PostSchema);