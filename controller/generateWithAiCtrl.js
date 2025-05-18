// y

// const  generateProductDescription = async (req, res)=> {
//     console.log(req.body)
//     const {productDetails}= req.body
//     console.log(productDetails.name)
//   try {
//     const prompt = `
//       Write a detailed and engaging product description for the following product:
//       Name: ${productDetails.name}
//       Category: ${productDetails.category}
//       Features: ${productDetails.features.join(', ')}
//     `;

//     const response = await openai.chat.completions.create({
//       model: 'gpt-4', // or 'gpt-3.5-turbo' for a faster response
//       messages: [
//         { role: 'system', content: 'You are a product description generator.' },
//         { role: 'user', content: prompt },
//       ],
//     });
//      console.log(response)
//     return res.send(response.choices[0].message.content);
//   } catch (error) {
//     console.error('Error generating product description:', error);
//   }
// }





// module.exports = {generateProductDescription}