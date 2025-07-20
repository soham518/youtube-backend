import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generatAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

//this is a register user function wrapped in a async handler to manage errors effectively,
// as it is a wrapper function that takes input as a function. This is to avoid try,catch or promise to all functions.
//this will take the data from the frontend through url: users/. and perform operations like register, update delete etc.

//register user controller

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

  if (
    [fullname, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "full name is required");
  }

  //check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, " User with email or username alredy exists. ");
  }

  //file url logic for saving avatar and cover image.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //as avatar image is manditory
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  //check if cover image is present or not.
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
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
    coverImage: coverImage?.url || "", //as coverImage is not compulsery
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
  // console.log(res.files) //check if we have files and their path.
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

//controller for user login.

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = User.findOne({
    //this will find username or email from the db
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  //make sure you take the new created user to compare password and the User(it is a mongoose model) does not have the methods
  //user has as.
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user Credentials");
  }

  const { accessToken, refreshToken } = await generatAccessAndRefreshToken(
    user._id
  );
  //(done) save access token and generate cookies.

  //now this loggedInUser does not have password and refresh token with it.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//controller for user logout

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
});
export { loginUser, logoutUser, registerUser };
