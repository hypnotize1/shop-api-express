import Coupon from "../models/coupon.js";
import AppError from "../utils/appError.js";

// -------------------------------------------------
// @desc 			Create a coupon
// @route 		POST  /api/coupons
// @access 		Private (logged-in user with the admin role)

export const createCoupon = async (req, res) => {
  // 1. Destructure the exact fields
  const { name, expire, discount } = req.body;

  // 2. Save the coupon in the database
  const coupon = await Coupon.create({
    name,
    expire,
    discount,
  });

  // 2. Send response
  res.status(201).json({
    status: "success",
    data: {
      coupon,
    },
  });
};

// -------------------------------------------------
// @desc 		 Get all coupons
// @route  	 GET /api/coupons
// @access	 Private (logged-in user with the admin role)
export const getAllCoupons = async (req, res) => {
  // 1. Find all coupons in the database
  const coupons = await Coupon.find();

  // 2. Send response
  res.status(200).json({
    status: "success",
    results: coupons.length,
    data: {
      coupons,
    },
  });
};

// -------------------------------------------------
// @desc 		 Delete a coupon
// @route  	 DELETE /api/coupons/:id
// @access	 Private (logged-in user with the admin role)
export const deleteCoupon = async (req, res) => {
  // 1. Check the coupon with this ID in database to delete the coupon
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  // 2. If it returns null, it means no document had that ID
  if (!coupon) {
    throw new AppError("No coupon found with this ID", 404);
  }

  // 3. Send response
  res.status(204).send();
};

// -------------------------------------------------
// @desc 		 Update a coupon
// @route  	 PATCH /api/coupons/:id
// @access	 Private (logged-in user with the admin role)
export const updateCoupon = async (req, res) => {
  // 1. Get Fields for update
  const { name, discount, expire } = req.body;

  // 2. Find coupon with ID and update
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { name, discount, expire },
    {
      runValidators: true,
      new: true,
    },
  );

  if (!coupon) {
    throw new AppError("No coupon found with that ID", 404);
  }

  // 3. Send response
  res.status(200).json({
    status: "success",
    data: {
      coupon,
    },
  });
};

// -------------------------------------------------
// @desc 		 Get a coupon
// @route  	 GET /api/coupons/:id
// @access	 Private (logged-in user with the admin role)
export const getCoupon = async (req, res) => {
  // 1. Find the coupon in database
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError("No coupon found with that ID", 404);
  }

  // 2. Send response
  res.status(200).json({
    status: "success",
    data: {
      coupon,
    },
  });
};
