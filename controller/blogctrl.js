const asyncHandle = require("express-async-handler");
const Blogs = require("../models/blogModel");
const OpenAI = require('openai');

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,  // Your API Key
// });

const addBlog = asyncHandle(async (req, res) => {
  const blog = req.body;
  console.log(blog)
  const alreadyavail = await Blogs.findOne({ title: blog.title });
  if (alreadyavail) {
    try {
      const updateblog = await Blogs.findOneAndUpdate(
        { title: blog.title },
        blog
      );
      res.json(updateblog);
    } catch (error) {
      res.send(500).send({ error: error.message });
    }
  } else {
    try {
      const newblog = await Blogs.create(blog);
      res.json(newblog);
    } catch (error) {
      if (error.message.includes("duplicate")) {
        res
          .status(500)
          .send(
            `Entered ${
              error.message.split("{")[1].split(":")[0]
            } is already registered`
          );
      } else {
        res.status(500).send(error.message);
      }
    }
  }
});

const getallblogs = asyncHandle(async (req, res) => {
  const blogs = await Blogs.find().sort({createdAt: 'desc'});
  console.log(blogs)
  res.json(blogs);
});

const deleteblogs = asyncHandle(async (req, res) => {
  if (req.body._id) {
    const { _id } = req.body;
    try {
      const deletedBlog = await Blogs.findByIdAndDelete({ _id });
      if(deletedBlog){
        res.json({success: true, message: "Deleted Sucessfully"});
      }
      res.json({success: false, message: "Blog doesn't exist"});
    } catch (error) {
      res.json(error.message);
    }
  } else {
    res.json("invalid Operation");
  }
});
const updateblog = asyncHandle(async (req, res) => {
  if (req.body._id) {
    const { _id } = req.body;
    const dta = {
      title: req.body.title,
      content: req.body.content,
      image: req.body.image,
    }
    try {
      const updateblog = await Blogs.findByIdAndUpdate({_id},dta);
      res.json({message:"Blog updated Sucessfully.",success:true})
    } catch (error) {
      res.status(500).send(error.message);
    }
  } else res.status(500).send("invalid Operation");
});

const getBlog = asyncHandle(async (req, res)=>{
  if(req.params.id){
    const {id} = req.params;
    const blog = await Blogs.findById(id);
    if(blog){
      res.json({
        success: true,
        ...blog._doc
      })
    }
    else{
      res.json({
        success: false,
        message: "Blog doesn't exist."
      })
    }
  }
  else{
    res.json("invalid operation");
  }
})
// const  generateBlogContent = async (req, res) => {
//   console.log(req.body)
//   const {topic} = req.body
//   try {
//     const prompt = `
//      Your Are Expert Gym Trainer with Knowledge of All the Gym Equipments
//       Write a detailed blog post on the topic: "${topic}".
//       Include key benefits, examples, and practical advice.
//     `;

//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo'
//       messages: [
//         { role: 'system', content: 'You are a blog content writer.' },
//         { role: 'user', content: prompt },
//       ],
//     });

//     return res.send({
//       success: true,
//       data: response.choices[0].message.content
//     })
//   } catch (error) {
//     console.error('Error generating blog content:', error);
//   }
// }


module.exports = {
  addBlog,
  getallblogs,
  deleteblogs,
  updateblog,
  getBlog,
  // generateBlogContent
};
