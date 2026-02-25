import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

// @desc        Create a order
// @route       POST /api/orders
// @access      Public (logged-in users)
export const createOrder = async (req, res, next) => {
  // 1.	Create session
  const session = await mongoose.startSession();

  // 2. Start transaction
  session.startTransaction();

  try {
    // 3. Find the user cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      throw new AppError("User's Cart is clear!", 404);
    }

    // 3. Calculate the final price
    const price =
      cart.totalPriceAfterDiscount > 0
        ? cart.totalPriceAfterDiscount
        : cart.totalCartPrice;

    // 4. Create order with user cart
    const orders = await Order.create(
      [
        {
          user: req.user._id,
          items: cart.cartItems,
          shippingAddress: req.body.shippingAddress,
          totalPrice: price,
        },
      ],
      { session },
    );
    const order = orders[0];

    // 5. Reduce inventory
    const bulkOptions = cart.cartItems.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: { stock: -item.quantity, sold: +item.quantity },
          },
        },
      };
    });

    await Product.bulkWrite(bulkOptions, { session });

    // 6. Clear user cart
    await Cart.findOneAndDelete({ user: req.user._id }).session(session);

    // 7. Commit
    await session.commitTransaction();

    // 8. End session
    session.endSession();

    // 9. Send response
    res.status(201).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (err) {
    // 10. Cancel the operation (Rollback)
    await session.abortTransaction();
    session.endSession();
    return next(err);
  }
};
