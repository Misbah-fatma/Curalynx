// import Product from '../models/Product.js';

// export const addProduct = async (req, res) => {
//   try {
//     const { name, category, price, quantity, description, medicineType } = req.body;
//     console.log(req.body);

//     if (!name || !category || !price || !quantity) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const product = await Product.create({
//       name,
//       category,
//       price,
//       quantity,
//       description,
//       medicineType,
//       createdBy: req.user, // from auth middleware
//     });

//     res.status(201).json({ message: 'Product added successfully', product });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
