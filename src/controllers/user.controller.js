import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.jsx";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend.
  //take validation - not empty
  //check if user alredy exists: usernam/email
  //check for images, check for avatar
  //upload them to cloudinary, avtar
  //save the cloudinary url
  //create user object - create entry in db
  //remove password and refreshtoken feild form response
  //check for user creation.
  //return response

  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);

  if (
    [fullname, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "full name is required");
  }

  //check for existing user
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, " User with email or username alredy exists. ");
  }

  //file url logic for saving avatar and cover image.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //as avatar image is manditory
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  //as we have the locak file path now we can upload the file to cloudinary
  const avtar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtar) {
    throw new ApiError(400, "Avatar image is required");
  }

  const user = await User.create({
    fullname,
    avatar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  //check if user is added or not.
  const createdUser = await User.findById(user._id).select(
    //this will exclude the password and refresh token
    "-password -refreshToken"
  );
  //return error if user not found/registered
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while adding the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
