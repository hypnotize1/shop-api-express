import Cart from "../models/cart.js";
import Product from "../models/product.js";
import Coupon from "../models/coupon.js";
import AppError from "../utils/appError.js";
import { calcTotalCartPrice } from "../utils/cartHelper.js";

// --------------------------------------------------
// @desc       Add a product to the cart
// @route      POST /api/cart
// @access     Private (Logged-in users only)
export const addProductToCart = async (req, res, next) => {
  // 1. Extract product ID from the request body
  const { productId } = req.body;

  // 2. Fetch the product from the DB to get its current, actual price
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found!", 404);
  }

  // 3. Find if the currently logged-in user already has a cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Scenario A: User doesn't have a cart yet.
    // Create a new cart and add the first item.
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          price: product.price,
        },
      ],
    });
  } else {
    // Scenario B: User already has a cart.
    // Check if the exact product already exists in the cartItems array.
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (productIndex > -1) {
      // B-1: Product exists in the cart.
      // Update its quantity by reference.
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // B-2: Product is completely new to this cart.
      // Push it as a new object into the cartItems array.
      cart.cartItems.push({
        product: productId,
        price: product.price,
      });
    }
  }

  // 4. Update the total price of the cart.
  calcTotalCartPrice(cart);

  // 5. Save the updated cart document to the database
  await cart.save();

  // 6. Send the final response
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: {
      cart,
    },
  });
};

// --------------------------------------------------
// @desc        Get logged-in user's cart
// route        GET‌ /api/cart
// @access      Private (Logged-in users only)
export const getLoggedUserCart = async (req, res) => {
  // 1. Find the cart for the current user and populate the product details
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "cartItems.product",
    select: "title imageCover ratingAverage price",
  });

  // 2. If no cart exists in the database for this user, throw a 404 error
  if (!cart) {
    throw new AppError("There is no cart for this user", 404);
  }

  // 3. Send the response
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: {
      cart,
    },
  });
};

// --------------------------------------------------
// @desc       Remove specific cart item
// @route      DELETE /api/cart/:itemId
// @access     Private (Logged-in users only)
export const removeSpecificCartItem = async (req, res) => {
  // 1. Find the cart and directly remove the item using MongoDB's $pull operator
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true },
  );

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  // 2. Recalculate the total price after the item is removed
  calcTotalCartPrice(cart);

  // 3. Save the updated cart
  await cart.save();

  // 4. Send the response
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: {
      cart,
    },
  });
};

// --------------------------------------------------
// @desc        Update specific cart item quantity
// @route       PATCH /api/cart/:itemId
// @access      Private (Logged-in users only)

export const updateCartItemQuantity = async (req, res) => {
  const { quantity } = req.body;

  // 1. Find the user's cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  // 2. Find the index of specific item inside the cartItems array
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId,
  );

  if (itemIndex > -1) {
    // 3. Update the quantity of the found item by reference
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    throw new AppError("Item not found in the cart", 404);
  }

  // 4. Recalculate the total price with the new quantity
  calcTotalCartPrice(cart);

  // 5. Save the changes to the database
  await cart.save();

  // 6. Send the response
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: {
      cart,
    },
  });
};

// --------------------------------------------------
// @desc       Clear logged-in user's cart
// @route      DELETE /api/cart
// @access     Private (Logged-in users only)
export const clearCart = async (req, res) => {
  // 1. Find the cart by user ID and completely delete the document from the database
  await Cart.findOneAndDelete({ user: req.user._id });

  // 2. Send a 204 (No Content) response
  res.status(204).send();
};

// --------------------------------------------------
// @desc      Apply Discount on cart totalPrice
// @route     PATCH /api/cart/applyCoupon
// @access    Private (Logged-in users only)
export const applyCoupon = async (req, res) => {
  // 1. Get coupon's name
  const { couponName } = req.body;

  // 2. Check the existence AND expiration directly in the  database
  const coupon = await Coupon.findOne({
    name: couponName,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    throw new AppError("Coupon is invalid or expired", 400);
  }
  // 3. Find the user's cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError("No cart found for this user", 404);
  }

  // 4. Check the cartItems array
  if (cart.cartItems.length === 0) {
    throw new AppError("Your cart is empty!", 400);
  }

  // 5. Add a condition to prevent rediscounting
  if (cart.totalPriceAfterDiscount > 0) {
    throw new AppError("Discount has already been applied", 400);
  }

  // 6. Calculate the total price AFTER applying the discount
  const discountAmount = (cart.totalCartPrice * coupon.discount) / 100;

  cart.totalPriceAfterDiscount = Math.round(
    cart.totalCartPrice - discountAmount,
  );

  // 7. Save the updated cart
  await cart.save();

  // 8. Send response
  res.status(200).json({
    status: "success",
    message: `Coupon ${coupon.name} applied successfully!`,
    data: {
      cart,
    },
  });
};

// --------------------------------------------------
// @desc      Delete Discount on cart totalPrice
// @route     DELETE /api/cart/removeCoupon
// @access    Private (Logged-in users only)
export const removeCoupon = async (req, res) => {
  // 1. Find the user's cart
  const cart = await Cart.findOne({ user: req.user._id });

  // 2. Check if coupon has been applied or not
  if (cart.totalPriceAfterDiscount <= 0) {
    throw new AppError("There is no discount for deletion", 400);
  }

  // 3. Delete coupon and Save the cart
  cart.totalPriceAfterDiscount = undefined;
  await cart.save();

  // 4. Send response
  res.status(200).json({
    status: "success",
    message: "Coupon removed successfully!",
    data: {
      cart,
    },
  });
};
