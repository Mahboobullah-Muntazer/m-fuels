const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../lib/models');
const OTP = require('../../lib/otpModel');

const Supplier = require('../../lib/supplier'); // Import the OTP model
const Customer = require('../../lib/customer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Purchase = require('../../lib/purchase');
const Sale = require('../../lib/sale');
const Expense = require('../../lib/expense');

const  CashAccount = require('../../lib/cashAccount');
const LastBillNumber = require('../../lib/lastBillNumber');
const CollectionsDateManagement = require('../../lib/collectionsDateManagement');

const path = require('path'); // Import the 'path' module
const multer = require('multer');

const { spawn } = require('child_process');
const stream = require('stream');
const unzipper = require('unzipper');
const mongoose = require('mongoose');

require('dotenv').config();

const { exec } = require('child_process');
const fs = require('fs');
const Sarafi = require('../../lib/sarafi');


const Transaction = require('../../lib/transaction');
const Stock = require('../../lib/stock');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'upload')); // Adjust the path based on your project structure
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log('ready for message');
    console.log(success);
  }
});

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

router.post('/restore', upload.single('backupFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'No backup file provided for restore.' });
    }

    // Assuming the uploaded file is a zip archive
    const zipBuffer = req.file.buffer;
    const extractedFolder = await unzipper.Open.buffer(zipBuffer);

    // Assuming the database name is the same as the folder name in the zip file
    const dbName = extractedFolder.files[0].path;

    // Create a temp directory to extract the backup files
    const tempDir = path.join(__dirname, 'temp');
    await extractedFolder.extract({ path: tempDir });

    // Execute mongorestore command
    exec(
      `mongorestore --drop --db ${dbName} ${tempDir}`,
      (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ message: `Restore failed: ${stderr}` });
        }

        return res.status(200).json({ message: 'Restore successful.' });
      }
    );
  } catch (error) {
    console.error('Restore failed:', error.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Your MongoDB connection URI
const mongoURI =
  'mongodb+srv://mahboobullahmuntazer2005:c1ByHzhvvrLsYSpZ@cluster0.qvaiggy.mongodb.net/Mashraqiwal?retryWrites=true&w=majority';

// Your MongoDB backup directory
const backupDirectory = path.join(__dirname, '..', '..', 'backup');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDirectory)) {
  fs.mkdirSync(backupDirectory);
}

// Define the backup route

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDirectory)) {
  fs.mkdirSync(backupDirectory);
}

// Define the backup route
router.get('/backup', (req, res) => {
  // You may want to add some authentication or authorization checks here before allowing access to the backup
  // ...

  // Execute mongodump command
  const dumpCommand = `mongodump --uri "${mongoURI}" --out ${backupDirectory}`;

  const mongodumpProcess = spawn(dumpCommand, { shell: true });

  let progress = 0;

  // Use a writable stream to capture mongodump output
  const outputStream = new stream.Writable({
    write(chunk, encoding, callback) {
      const output = chunk.toString();
      // Check for progress information in the output
      const match = output.match(/(\d+\.?\d*)%.*\r/);
      if (match) {
        progress = parseFloat(match[1]);
        // Send progress to the client
        res.write(`Backup Progress: ${progress}%\n`);
      }
      callback();
    },
  });

  // Handle process events
  mongodumpProcess.stdout.pipe(outputStream);
  mongodumpProcess.stderr.on('data', (data) => {
    // Handle error output
    console.error(`Error during mongodump: ${data.toString()}`);
  });

  mongodumpProcess.on('close', (code) => {
    if (code === 0) {
      // Backup completed successfully, send completion message
      res.write('Backup Completed!\n');
    } else {
      // Backup failed, send error message
      res.write(`Backup Failed with exit code: ${code}\n`);
    }

    // End the response
    res.end();

    // Optionally, you can remove the local backup files after sending
  });

  // Don't close the server connection until the backup is complete
  res.setHeader('Connection', 'keep-alive');
});

router.post('/sendEmailVerification', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a new 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if OTP already exists for the given email
    const existingOTP = await OTP.findOne({ email });

    if (existingOTP) {
      // Send email with existing OTP and its expiration time

      res
        .status(200)
        .json({ status: 'SUCCESS', message: 'Please check your email!' });
    } else {
      // Save the new OTP to MongoDB
      const otp = new OTP({
        email,
        code: generatedOTP,
      });

      const savedOTP = await otp.save();

      // Send email with the new OTP and its expiration time
      const newOTPEmailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Your Confirmation Code',
        html: `<p>Your confirmation code is ${generatedOTP}. It expires at ${savedOTP.expiresAt}</p>`,
      };

      transporter.sendMail(newOTPEmailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res
            .status(500)
            .json({ status: 'FAILED', message: 'Failed to send email' });
        } else {
          res.status(200).json({
            status: 'SUCCESS',
            message: 'Confirmation Code has been sent',
          });
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.post('/confirmOTP', async (req, res) => {
  try {
    const { email, confirmationCode } = req.body;
    const currentTime = new Date();

    // Find the OTP document for the given email
    const otpDocument = await OTP.findOne({ email });
    if (otpDocument && confirmationCode === otpDocument.code) {
      await OTP.deleteOne({ email });

      return res
        .status(200)
        .json({ status: 'SUCCESS', message: 'confirmed successfully' });
    } else if (!otpDocument) {
      return res
        .status(200)
        .json({ status: 'FAILED', message: 'Confirm code is not available' });
    }

    // Check if entered OTP matches the stored OTP
    else if (confirmationCode !== otpDocument.code) {
      return res
        .status(200)
        .json({ status: 'FAILED', message: 'invalid confirmation code' });
    }

    // Check if OTP has expired
    else if (currentTime > otpDocument.expiresAt) {
      return res
        .status(200)
        .json({ status: 'FAILED', message: 'code is expired' });
    }

    // If OTP is valid, you can delete the document from MongoDB
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.post(
  '/users',

  async (req, res) => {
    //$2b$10$yqGBQnVdUhc3B5a4.WeH6ek5vPqc1gMGiywbO4491hSc2W/stp6Ri
    let { fullName, userName, userType, email, password } = req.body;

    let jwtToken = 'none';

    if (fullName == '' || password == '' || userName == '') {
      res.json({
        status: 'FAILED',
        message: 'Empty input fields!',
      });
    } else if (password.length < 6) {
      res.json({
        status: 'FAILED',
        message: 'پاسورد باید د 5 عددو څخه زیات وی ',
      });
    } else {
      // cehck if user already exists
      if (email && email.trim() !== '') {
        const exsistantEmail = await User.find({ email });

        if (exsistantEmail.length) {
          // a user already exists
          res.json({
            status: 'FAILED',
            message: 'یوزر د ده ایمیل سره مخکی نه شته',
          });
        } else {
          const exsistantUserName = await User.find({ userName });
          if (exsistantUserName.length) {
            res.json({
              status: 'FAILED',
              message: 'موجود دی  userName ',
            });
          } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = new User({
              fullName,
              email,
              password: hashedPassword,
              userName,
              userType,
            });
            const result = await user.save();

            res.json(result);
          }

          // add new user

          //password handling
        }
      } else {
        const exsistantEmail = await User.find({ userName });
        if (exsistantEmail.length) {
          res.json({
            status: 'FAILED',
            message: 'موجود دی  userName ',
          });
        } else {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const user = new User({
            fullName,
            password: hashedPassword,
            userName,
            userType,
          });
          const result = await user.save();
          res.json(result);
        }
      }
    }
  }
);

router.get('/getAllUsers', auth, async (req, res) => {
  try {
    let users = await User.find();
    if (users.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'There are no users!',
      });
    } else {
      return res.json(users);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'Server Error!',
    });
  }
});

router.put('/updateUser', auth, async (req, res) => {
  const userData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(userData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // If the password is provided in cleanedData, check its length
    if (cleanedData.password) {
      if (cleanedData.password.length < 6) {
        return res.status(400).json({
          status: 'FAILED',
          message: 'Password must be at least 6 characters long',
        });
      }

      const saltRounds = 10;
      cleanedData.password = await bcrypt.hash(
        cleanedData.password,
        saltRounds
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: cleanedData._id },
      { $set: cleanedData },
      { new: true, useFindAndModify: false }
    );

    if (updatedUser) {
      res.json({ status: 'success', user: updatedUser });
    } else {
      res.status(404).json({ status: 'FAILED', message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.delete('/deleteUser/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Perform the deletion logic here
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.json({ status: 'success', message: 'User deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by either username or email
    const user = await User.findOne({
      $or: [{ userName: emailOrUsername }, { email: emailOrUsername }],
    });

    if (!user) {
      return res.json({
        status: 'FAILED',
        message: 'incorect username',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({
        status: 'FAILED',
        message: 'Invalid password',
      });
    }

    const token = createToken(user._id);
    // Return the userType
    return res.status(200).json({
      userId: user._id,
      fullName: user.fullName,
      userType: user.userType, // Adjust this according to your user schema
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/addSupplier', auth, async (req, res) => {
  try {
    // Create a new supplier instance using the Supplier model
    const newSupplier = new Supplier(req.body);

    // Save the new supplier to the database
    await newSupplier.save();

    res
      .status(201)
      .json({ status: 'SUCCESS', message: 'Supplier added successfully' });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'An error occurred while adding the supplier',
    });
  }
});

router.get('/getAllSuppliers', auth, async (req, res) => {
  try {
    let suppliers = await Supplier.find();
    if (suppliers.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'There are no suppliers!',
      });
    } else {
      return res.json(suppliers);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'Server Error!',
    });
  }
});

router.put('/updateSupplier', auth, async (req, res) => {
  const userData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(userData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // If the password is provided in cleanedData, check its length

    const updateSupplier = await Supplier.findOneAndUpdate(
      { _id: cleanedData._id },
      { $set: cleanedData },
      { new: true, useFindAndModify: false }
    );

    if (updateSupplier) {
      res.json({ status: 'success', supplier: updateSupplier });
    } else {
      res.status(404).json({ status: 'FAILED', message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.delete('/deleteSupplier/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Perform the deletion logic here
    const deletedSupplier = await Supplier.findByIdAndDelete(userId);

    if (deletedSupplier) {
      res.json({ status: 'success', message: 'Supplier deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'supplier not found' });
    }
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});






router.post('/addCustomer', auth, async (req, res) => {
  try {
    // Create a new supplier instance using the Supplier model
    const newCustomer = new Customer(req.body);

    // Save the new supplier to the database
    await newCustomer.save();

    res.status(201).json({ status: 'SUCCESS', message: 'پیرودونکی ثبت شو' });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
    });
  }
});
router.get('/getAllCustomers', auth, async (req, res) => {
  try {
    let customers = await Customer.find();
    if (customers.length === 0) {
      return res.json({
        status: 'FAILED',
        message: ' پیرودونکی شتون نه لری',
      });
    } else {
      return res.json(customers);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});
router.put('/updateCustomer', auth, async (req, res) => {
  const userData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(userData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // If the password is provided in cleanedData, check its length

    const updateCustomer = await Customer.findOneAndUpdate(
      { _id: cleanedData._id },
      { $set: cleanedData },
      { new: true, useFindAndModify: false }
    );

    if (updateCustomer) {
      res.json({ status: 'success', supplier: updateCustomer });
    } else {
      res.status(404).json({ status: 'FAILED', message: 'پیرودونکی پیدا نشو' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});


router.post('/addSarafi', auth, async (req, res) => {
  try {
    // Create a new supplier instance using the Supplier model
    const newSarafi = new Sarafi(req.body);

    // Save the new supplier to the database
    await newSarafi.save();

    res.status(201).json({ status: 'SUCCESS', message: 'صرافی ثبت شو' });
  } catch (error) {
    console.error('Error adding sarafi:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
    });
  }
});


router.put('/updateSarafi', auth, async (req, res) => {
  const userData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(userData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // If the password is provided in cleanedData, check its length

    const updateSarafi = await Sarafi.findOneAndUpdate(
      { _id: cleanedData._id },
      { $set: cleanedData },
      { new: true, useFindAndModify: false }
    );

    if (updateSarafi) {
      res.json({ status: 'success', });
    } else {
      res.status(404).json({ status: 'FAILED', message: 'صرافی پیدا نشو' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});







router.get('/getAllSarafis', auth, async (req, res) => {
  try {
    let sarafis = await Sarafi.find();
    if (sarafis.length === 0) {
      return res.json({
        status: 'FAILED',
        message: ' صرافی شتون نه لری',
      });
    } else {
      return res.json(sarafis);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});



router.post('/addPurchase', auth, async (req, res) => {
  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert relevant fields to appropriate types
  
    // Set the customer and monthYear fields
  
    const existingAccount = await CashAccount.findOne({ name: 'Main' });
    if (!existingAccount) {
      const cashAccount = new CashAccount({ name: 'Main', balance: 0 });
      await cashAccount.save({ session });
      
    }
   
   


    const newPurchase = new Purchase({
      supplier: req.body.supplier,
      fuelType: req.body.fuelType,
      driverName: req.body.driverName,
      plateNumber: req.body.plateNumber,
      quantityInTons: req.body.quantityInTons,
      quantityInLiters: req.body.quantityInLiters,
      purchaseDate: req.body.purchaseDate,
      totalPrice: req.body.totalPrice,
      transferedFromAddress: req.body.transferedFromAddress,
      monthYear: req.body.collection, // Use the collection ID from the request body
    });

       

        const savedPurchase= await newPurchase.save({ session });
     

        await CashAccount.findOneAndUpdate(
          {name: 'Main'},
          { $inc: { balance: -parseFloat(req.body.totalPrice) } },
          { new: true, session }
        );

        const updatedStock =  await Stock.findOneAndUpdate(
          { fuelType: req.body.fuelType },  // corrected from {name: req.body.fuelType}
          { 
            $inc: { 
              quantityInLiters: parseFloat(req.body.quantityInLiters), 
              quantityInTons: parseFloat(req.body.quantityInTons) 
            } 
          },
          { new: true, session }
        );

        updatedStock.quantityInLiters = Math.round(updatedStock.quantityInLiters * 100) / 100;
updatedStock.quantityInTons = Math.round(updatedStock.quantityInTons * 100) / 100;

await updatedStock.save({ session });
        const newTransactionData = {
        
          monthYear:req.body.collection,
          totalAmount:parseFloat(req.body.totalPrice),
          paidAmount:parseFloat(req.body.totalPrice),
          remainingAmount:parseFloat(0),
          date: req.body.purchaseDate,
           paymentType:'cash',
           transactionType:'purchase',
           purchase:savedPurchase._id
        };
     
    
       
       
    
          const newTransaction = new Transaction(newTransactionData);
    
          const savedTransaction =  await newTransaction.save({ session });
       
            

            

    await session.commitTransaction();
    session.endSession();

    // Respond with success message and data
    res.status(201).json({
      status: 'SUCCESS',
      message: 'معلومات ثبت شو',
    
    });
    // Commit the transaction
    
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error adding Purchase:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی'
    });
  }
});


router.get('/getAllPurchases', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

console.log(monthYear)

    // Check if PurchaseCollection for the given month exists
    const purchasesTransactions = await Transaction.find({ monthYear: monthYear._id,transactionType:"purchase"  })
   
    .populate('purchase')
   
    .exec(); 

 
    if (!purchasesTransactions) {
      return res.json({
        status: 'FAILED',
        message: 'خرید شتون نه لری',
        data: [],
      });
    }



    return res.json({
      status: 'SUCCESS',
      data: purchasesTransactions,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});



router.put('/updatePurchase', auth, async (req, res) => {
  const purchaseData = req.body;

  
 
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const newPurchaseData = {
      supplier:purchaseData.supplier,
      fuelType:purchaseData.fuelType,
      driverName:purchaseData.driverName,
      plateNumber:purchaseData.plateNumber,
      quantityInTons:purchaseData.quantityInTons,
      quantityInLiters:purchaseData.quantityInLiters,
      totalPrice:purchaseData.totalPrice,
      transferedFromAddress:purchaseData.transferedFromAddress,
      purchaseDate:purchaseData.purchaseDate,
  
    };
    const cleanedData = {};
    for (const [key, value] of Object.entries(newPurchaseData)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanedData[key] = value;
      }
    }
 
   
    const updatePurchase = await Purchase.findOneAndUpdate(
      {
  
        _id: purchaseData._id,
      },
      { $set: cleanedData },
      { new: true, useFindAndModify: false,session }
    );
  
    if(!updatePurchase)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }


      const newTransactionData = {
        
        
        totalAmount:purchaseData.totalPrice,
        paidAmount:purchaseData.totalPrice,
        remainingAmount:parseFloat(0),
        date: req.body.purchaseDate,
         paymentType:'cash',
         transactionType:'purchase',
         
      };

      const cleanedTransactionData = {};
    for (const [key, value] of Object.entries(newTransactionData)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanedTransactionData[key] = value;
      }
    }

    const updatePurchaseTransaction = await Transaction.findOneAndUpdate(
      {
  
        _id: purchaseData.purchaseData._id,
      },
      { $set: cleanedTransactionData },
      { new: true, useFindAndModify: false,session }
    );
  
    if(!updatePurchaseTransaction)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }

    if(purchaseData.totalPrice !=='' && purchaseData.totalPrice !==null && purchaseData.totalPrice !==undefined)
   
      {
         const oldPrice=parseFloat(purchaseData.purchaseData.purchase.totalPrice)
         const newPrice=parseFloat(purchaseData.totalPrice)
        
         if(oldPrice!==newPrice)
          {

            const differance=oldPrice-newPrice;

            const roundedDifference = Math.round(differance * 100) / 100;
         
            const updateCash=  await CashAccount.findOneAndUpdate(
              {name: 'Main'},
              { $inc: { balance: parseFloat(roundedDifference) } },
              { new: true, session }
            );
            
            if(!updateCash)
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }
          }


      }

    
      if(purchaseData.fuelType===purchaseData.purchaseData.purchase.fuelType)
      {
        if(purchaseData.quantityInLiters!='' && purchaseData.quantityInLiters!=null &&  purchaseData.quantityInLiters!=undefined)
        {
          const oldQuantity=parseFloat(purchaseData.purchaseData.purchase.quantityInLiters)
          const newQuantity=parseFloat(purchaseData.quantityInLiters)
         
          if(oldQuantity!==newQuantity)
           {
 
             const differance=oldQuantity-newQuantity;
             const roundedDifference = Math.round(differance * 100) / 100;
         
            const updatedStock= await Stock.findOneAndUpdate(
              { fuelType: purchaseData.fuelType },  // corrected from {name: req.body.fuelType}
              { 
                $inc: { 
                  quantityInLiters: -parseFloat(roundedDifference), 
                 
                } 
              },
              { new: true, session }
            );
             
             
             if(!updatedStock)
               {
                 await session.abortTransaction();
             session.endSession();
         
             return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
               }
           }

           updatedStock.quantityInLiters = Math.round(updatedStock.quantityInLiters * 100) / 100;
          
           
           await updatedStock.save({ session });


        }

        if(purchaseData.quantityInTons!='' && purchaseData.quantityInTons!=null &&  purchaseData.quantityInTons!=undefined)
          {
            const oldQuantity=parseFloat(purchaseData.purchaseData.purchase.quantityInTons)
            const newQuantity=parseFloat(purchaseData.quantityInTons)
           
            if(oldQuantity!==newQuantity)
             {
   
               const differance=oldQuantity-newQuantity;
               const roundedDifference = Math.round(differance * 100) / 100;
         
              const updatedStock= await Stock.findOneAndUpdate(
                { fuelType: purchaseData.fuelType },  // corrected from {name: req.body.fuelType}
                { 
                  $inc: { 
                    quantityInTons: -parseFloat(roundedDifference), 
                   
                  } 
                },
                { new: true, session }
              );
               
               
               if(!updatedStock)
                 {
                   await session.abortTransaction();
               session.endSession();
           
               return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                 }

                
                 updatedStock.quantityInTons = Math.round(updatedStock.quantityInTons * 100) / 100;
                 
                 await updatedStock.save({ session });
      
             }
          }
      }else
      {

        if(purchaseData.quantityInLiters!='' && purchaseData.quantityInLiters!=null &&  purchaseData.quantityInLiters!=undefined)
          {

            const updateStockOld= await Stock.findOneAndUpdate(
              { fuelType: purchaseData.purchaseData.purchase.fuelType },  // corrected from {name: req.body.fuelType}
              { 
                $inc: { 
                  quantityInLiters: -parseFloat(purchaseData.purchaseData.purchase.quantityInLiters), 
                 
                } 
              },
              { new: true, session }
            );
             
             
             if(!updateStockOld)
               {
                 await session.abortTransaction();
             session.endSession();
         
             return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
               }

               updateStockOld.quantityInLiters = Math.round(updateStockOld.quantityInLiters * 100) / 100;

// Save the rounded values back to the database
await updateStockOld.save({ session });
    
               const updateStock= await Stock.findOneAndUpdate(
                { fuelType: purchaseData.fuelType },  // corrected from {name: req.body.fuelType}
                { 
                  $inc: { 
                    quantityInLiters: parseFloat(purchaseData.quantityInLiters), 
                  
                  } 
                },
                { new: true, session }
              );
               
               
               if(!updateStock)
                 {
                   await session.abortTransaction();
               session.endSession();
           
               return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                 }

                 updateStock.quantityInLiters = Math.round(updateStock.quantityInLiters * 100) / 100;

                 // Save the rounded values back to the database
                 await updateStock.save({ session });

          }else
          {
            const updateStockOld= await Stock.findOneAndUpdate(
              { fuelType: purchaseData.purchaseData.purchase.fuelType },  // corrected from {name: req.body.fuelType}
              { 
                $inc: { 
                  quantityInLiters: -parseFloat(purchaseData.purchaseData.purchase.quantityInLiters), 
                 
                } 
              },
              { new: true, session }
            );
             
             
             if(!updateStockOld)
               {
                 await session.abortTransaction();
             session.endSession();
         
             return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
               }

               updateStockOld.quantityInLiters = Math.round(updateStockOld.quantityInLiters * 100) / 100;

// Save the rounded values back to the database
await updateStockOld.save({ session });

    
               const updateStock= await Stock.findOneAndUpdate(
                { fuelType: purchaseData.fuelType },  // corrected from {name: req.body.fuelType}
                { 
                  $inc: { 
                    quantityInLiters: parseFloat(purchaseData.purchaseData.purchase.quantityInLiters), 
                  
                  } 
                },
                { new: true, session }
              );
               
               
               if(!updateStock)
                 {
                   await session.abortTransaction();
               session.endSession();
           
               return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                 }

                 updateStock.quantityInLiters = Math.round(updateStock.quantityInLiters * 100) / 100;

// Save the rounded values back to the database
await updateStock.save({ session });
          }

          if(purchaseData.quantityInTons!='' && purchaseData.quantityInTons!=null &&  purchaseData.quantityInTons!=undefined)
            {
  
              const updateStockOld= await Stock.findOneAndUpdate(
                { fuelType: purchaseData.purchaseData.purchase.fuelType },  // corrected from {name: req.body.fuelType}
                { 
                  $inc: { 
                    quantityInTons: -parseFloat(purchaseData.purchaseData.purchase.quantityInTons), 
                   
                  } 
                },
                { new: true, session }
              );
               
               
               if(!updateStockOld)
                 {
                   await session.abortTransaction();
               session.endSession();
           
               return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                 }

               
                 updateStockOld.quantityInTons = Math.round(updateStockOld.quantityInTons * 100) / 100;

// Save the rounded values back to the database
await updateStockOld.save({ session });

      
                 const updateStock= await Stock.findOneAndUpdate(
                  { fuelType: purchaseData.fuelType },  // corrected from {name: req.body.fuelType}
                  { 
                    $inc: { 
                      quantityInTons: parseFloat(purchaseData.quantityInTons), 
                    
                    } 
                  },
                  { new: true, session }
                );
                 
                 
                 if(!updateStock)
                   {
                     await session.abortTransaction();
                 session.endSession();
             
                 return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                   }

                   updateStock.quantityInTons = Math.round(updateStock.quantityInTons * 100) / 100;

                   // Save the rounded values back to the database
                   await updateStock.save({ session });
  
            }else
            {
              const updateStockOld= await Stock.findOneAndUpdate(
                { fuelType: purchaseData.purchaseData.purchase.fuelType },  // corrected from {name: req.body.fuelType}
                { 
                  $inc: { 
                    quantityInTons: -parseFloat(purchaseData.purchaseData.purchase.quantityInTons), 
                   
                  } 
                },
                { new: true, session }
              );
               
               
               if(!updateStockOld)
                 {
                   await session.abortTransaction();
               session.endSession();
           
               return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                 }

                 updateStockOld.quantityInTons = Math.round(updateStockOld.quantityInTons * 100) / 100;

                 // Save the rounded values back to the database
                 await updateStockOld.save({ session });
      
                 const updateStock= await Stock.findOneAndUpdate(
                  { fuelType: purchaseData.fuelType },  // corrected from {name: req.body.fuelType}
                  { 
                    $inc: { 
                      quantityInTons: parseFloat(purchaseData.purchaseData.purchase.quantityInTons), 
                    
                    } 
                  },
                  { new: true, session }
                );
                 
                 
                 if(!updateStock)
                   {
                     await session.abortTransaction();
                 session.endSession();
             
                 return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                   }

                   updateStock.quantityInTons = Math.round(updateStock.quantityInTons * 100) / 100;

                   // Save the rounded values back to the database
                   await updateStock.save({ session });
            }

      }


    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد تغیر شو' });
       
        } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error updating Purchase:', error);
    res.status(500).json({ status: 'FAILED', message: 'سرور مشکل' });
  }
});




router.post('/deletePurchase', auth, async (req, res) => {
  
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find SaleCollection by monthYear
    const deletePurchase= await Purchase.findByIdAndDelete(req.body.purchase._id).session(session);

    if(!deletePurchase)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
      }

      const deletePurchaseTransaction= await Transaction.findByIdAndDelete(req.body._id).session(session);

      if(!deletePurchaseTransaction)
        {
          await session.abortTransaction();
      session.endSession();
  
      return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
        }
 
      const updateCash=  await CashAccount.findOneAndUpdate(
        {name: 'Main'},
        { $inc: { balance: parseFloat(req.body.purchase.totalPrice) } },
        { new: true, session }
      );

      if(!updateCash)
        {
          await session.abortTransaction();
      session.endSession();
  
      return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
        }

  

        const deleteStockLiters= await Stock.findOneAndUpdate(
          { fuelType: req.body.purchase.fuelType },  // corrected from {name: req.body.fuelType}
          { 
            $inc: { 
              quantityInLiters: -parseFloat(req.body.purchase.quantityInLiters), 
             
            } 
          },
          { new: true, session }
        );
         
         
         if(!deleteStockLiters)
           {
             await session.abortTransaction();
         session.endSession();
     
         return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
           }
           deleteStockLiters.quantityInLiters = Math.round(deleteStockLiters.quantityInLiters * 100) / 100;
       
           // Save the rounded values back to the database
           await deleteStockLiters.save({ session });

           const deleteStockTons= await Stock.findOneAndUpdate(
            { fuelType: req.body.purchase.fuelType },  // corrected from {name: req.body.fuelType}
            { 
              $inc: { 
                quantityInTons: -parseFloat(req.body.purchase.quantityInTons), 
               
              } 
            },
            { new: true, session }
          );
           
           
           if(!deleteStockTons)
             {
               await session.abortTransaction();
           session.endSession();
       
           return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
             }

             deleteStockTons.quantityInTons  = Math.round(deleteStockTons.quantityInTons  * 100) / 100;
       
             // Save the rounded values back to the database
             await deleteStockTons.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد ډلیت شو' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res
      .status(500)
      .json({ status: 'failed', message: 'Error processing request' });
  }
});
// Backend route


router.get('/getAllExpenses', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;



    // Check if PurchaseCollection for the given month exists
    const expenseTransactions = await Transaction.find({ monthYear: monthYear._id,transactionType:"expense"  })
   
    .populate('expense')
   
    .exec(); 
    if (!expenseTransactions) {
      return res.json({
        status: 'FAILED',
        message: 'مصارف شتون نه لری',
        data: [],
      });
    }



    return res.json({
      status: 'SUCCESS',
      data: expenseTransactions,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});


router.post('/addExpense', auth, async (req, res) => {
  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert relevant fields to appropriate types
  
    // Set the customer and monthYear fields
  
    const existingAccount = await CashAccount.findOne({ name: 'Main' });
    if (!existingAccount) {
      const cashAccount = new CashAccount({ name: 'Main', balance: 0 });
      await cashAccount.save({ session });
      
    }
   


    req.body.amount = parseFloat(req.body.amount);

    const newExpense = new Expense({
      amount: parseFloat(req.body.amount),
      personName: req.body.personName,
      expenseDate: req.body.expenseDate,
      monthYear: req.body.collection,
      reason: req.body.reason
    });

    // Save the purchase to the database
   const savedExpense= await newExpense.save({session});

     
    const newTransactionData = {
        
      monthYear:req.body.collection,
      totalAmount:parseFloat(req.body.amount),
      paidAmount:parseFloat(req.body.amount),
      remainingAmount:parseFloat(0),
      date: req.body.expenseDate,
       paymentType:'cash',
       transactionType:'expense',
       expense:savedExpense._id
    };
 

   
   

      const newTransaction = new Transaction(newTransactionData);

       await newTransaction.save({ session });
   


        await CashAccount.findOneAndUpdate(
          {name: 'Main'},
          { $inc: { balance: -parseFloat(req.body.amount) } },
          { new: true, session }
        );

 
 

            

    await session.commitTransaction();
    session.endSession();

    // Respond with success message and data
    res.status(201).json({
      status: 'SUCCESS',
      message: 'معلومات ثبت شو',
    
    });
    // Commit the transaction
    
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error adding sale:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی'
    });
  }
});


router.post('/deleteExpense', auth, async (req, res) => {
  
  
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find SaleCollection by monthYear
    const deleteExpense= await Expense.findByIdAndDelete(req.body.expense._id).session(session);

    if(!deleteExpense)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
      }
      
      const deleteExpenseTransaction= await Transaction.findByIdAndDelete(req.body._id).session(session);

    if(!deleteExpenseTransaction)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
      }
      const updateCash=  await CashAccount.findOneAndUpdate(
        {name: 'Main'},
        { $inc: { balance: parseFloat(req.body.expense.amount) } },
        { new: true, session }
      );

      if(!updateCash)
        {
          await session.abortTransaction();
      session.endSession();
  
      return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
        }

  



    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد ډلیت شو' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res
      .status(500)
      .json({ status: 'failed', message: 'Error processing request' });
  }
});




router.put('/updateExpense', auth, async (req, res) => {
  const expenseData = req.body;

 
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const newExpenseData = {
      personName:expenseData.personName,
      expenseDate:expenseData.expenseDate,
      amount:expenseData.amount,
      reason:expenseData.reason
     
  
    };
    const cleanedData = {};
    for (const [key, value] of Object.entries(newExpenseData)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanedData[key] = value;
      }
    }
 
   
    const updateExpense = await Expense.findOneAndUpdate(
      {
  
        _id: expenseData._id,
      },
      { $set: cleanedData },
      { new: true, useFindAndModify: false,session }
    );
  
    if(!updateExpense)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }


      const newTransactionData = {
        
        
        totalAmount:expenseData.amount,
        paidAmount:expenseData.amount,
        remainingAmount:parseFloat(0),
        date: expenseData.expenseDate,
         paymentType:'cash',
         transactionType:'expense',
         
      };

      const cleanedTransactionData = {};
    for (const [key, value] of Object.entries(newTransactionData)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanedTransactionData[key] = value;
      }
    }

    const updatePurchaseTransaction = await Transaction.findOneAndUpdate(
      {
  
        _id: expenseData.expenseData._id,
      },
      { $set: cleanedTransactionData },
      { new: true, useFindAndModify: false,session }
    );
  
    if(!updatePurchaseTransaction)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }

    if(expenseData.amount !=='' && expenseData.amount !==null && expenseData.amount !==undefined)
   
      {
         const oldPrice=parseFloat(expenseData.expenseData.expense.amount)
         const newPrice=parseFloat(expenseData.amount)
        
         if(oldPrice!==newPrice)
          {

            const differance=oldPrice-newPrice;
            const roundedDifference = Math.round(differance * 100) / 100;
         
          
            const updateCash=  await CashAccount.findOneAndUpdate(
              {name: 'Main'},
              { $inc: { balance: parseFloat(roundedDifference) } },
              { new: true, session }
            );
            
            if(!updateCash)
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }
          }


      }

    


    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد تغیر شو' });
       
        } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error updating Expense:', error);
    res.status(500).json({ status: 'FAILED', message: 'سرور مشکل' });
  }
});




async function generateBillNumber(session) {
  try {
    let newBillNumber;

    try {
      // Find the document and update it by incrementing the billNumber
      const previousBillNumberDocument = await LastBillNumber.findOne().session(session);

      if (!previousBillNumberDocument) {
        // If the document doesn't exist, create it with the default value
        const newDocument = new LastBillNumber();
        newDocument.billNumber = 1; // Initial bill number
        await newDocument.save({ session });
        newBillNumber = newDocument.billNumber;
      } else {
        // Increment the existing billNumber and save the updated document
        const updatedBillNumberDocument = await LastBillNumber.findOneAndUpdate(
          {},
          { $inc: { billNumber: 1 } },
          { new: true, session }
        );
        newBillNumber = updatedBillNumberDocument.billNumber;
      }

      
      return newBillNumber;
    } catch (error) {
      console.error('Error generating bill number:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating bill number:', error);
    throw error;
  }
}





router.post('/addSale', auth, async (req, res) => {
  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert relevant fields to appropriate types
    const {
      quantityInTons,
      quantityInLiters,
      totalPrice,
      pricePerTon,
      pricePerLiter,
      totalPaid,
      remaining,
      customerId,
      saleDate,
      selectedCollection,
      fuelType,
      driverName,
      paymentType,
      sarafi,
      personName,
      paymentDate,
      receiptNumber,
      description,
      plateNumber
    } = req.body;

  
    // Set the customer and monthYear fields
    const customer = customerId;
    const monthYear = selectedCollection._id;

    const existingAccount = await CashAccount.findOne({ name: 'Main' });
    if (!existingAccount) {
      const cashAccount = new CashAccount({ name: 'Main', balance: 0 });
      await cashAccount.save({ session });
      
    }
    // Generate billNumber using the function and pass the session
    const billNumber = await generateBillNumber(session);



    const newSaleData = {
      customer,
      monthYear,
      fuelType,
      driverName,
      plateNumber,
      saleDate,
      billNumber
    };

    if (pricePerTon !== '' && pricePerTon !== undefined) {
      newSaleData.pricePerTon = parseFloat(pricePerTon);
    }
    if (pricePerLiter !== '' && pricePerLiter !== undefined) {
      newSaleData.pricePerLiter = parseFloat(pricePerLiter);
    }

    
    if (quantityInTons !== '' && quantityInTons !== undefined) {
      newSaleData.quantityInTons = parseFloat(quantityInTons);
    }
    if (quantityInLiters !== '' && quantityInLiters !== undefined) {
      newSaleData.quantityInLiters = parseFloat(quantityInLiters);
    }

        // Create a new Sale instance
        const newSale = new Sale(newSaleData);

        const savedSale =  await newSale.save({ session });
     



    const newTransactionData = {
      customer,
      monthYear,
      totalAmount:parseFloat(totalPrice),
      paidAmount:parseFloat(totalPaid),
      remainingAmount:parseFloat(remaining),
    };
      newTransactionData.transactionType='sale'
newTransactionData.sale=savedSale._id

    if(paymentType==='cash')
      {
        newTransactionData.date=saleDate
        newTransactionData.paymentType='cash'
        
      }else
      {
        newTransactionData.sarafi=sarafi
        newTransactionData.personName=personName
        newTransactionData.paymentType='sarafi'
        newTransactionData.receipt=receiptNumber
        newTransactionData.date=paymentDate
        newTransactionData.description=description
      }
   

      const newTransaction = new Transaction(newTransactionData);

      const savedTransaction =  await newTransaction.save({ session });
   
        
             await Customer.findByIdAndUpdate(
              {_id: customer},
              { $inc: { balance: -parseFloat(remaining) } },
              { new: true, session }
            );
    
    if(paymentType==='cash')
      {
         await CashAccount.findOneAndUpdate(
          {name: 'Main'},
          { $inc: { balance: parseFloat(totalPaid) } },
          { new: true, session }
        );

      }else
      {
         await Sarafi.findByIdAndUpdate(
          {_id: sarafi},
          { $inc: { balance: parseFloat(totalPaid) } },
          { new: true, session }
        );
      }
 

            
      const updatedStock =  await Stock.findOneAndUpdate(
        { fuelType: fuelType},  // corrected from {name: req.body.fuelType}
        { 
          $inc: { 
            quantityInLiters: -parseFloat(quantityInLiters), 
            quantityInTons: -parseFloat(quantityInTons) 
          } 
        },
        { new: true, session }
      );
// Round the values to avoid floating-point precision issues
updatedStock.quantityInLiters = Math.round(updatedStock.quantityInLiters * 100) / 100;
updatedStock.quantityInTons = Math.round(updatedStock.quantityInTons * 100) / 100;

await updatedStock.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Respond with success message and data
    res.status(201).json({
      status: 'SUCCESS',
      message: 'معلومات ثبت شو',
    
    });
    // Commit the transaction
    
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error adding sale:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی'
    });
  }
});


router.get('/getAllSalesRelatedTransactions', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    
    // Check if SaleCollection for the given month exists
    const sales = await Transaction.find({ monthYear: monthYear._id,transactionType:"sale" })
      .populate('customer')
      .populate('sale')
      .populate('sarafi')
      .exec(); 

      console.log(sales)
    if (!sales || sales.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'No sales found for the given month',
        data: [],
      });
    }

    
    return res.json({
      status: 'SUCCESS',
      data: sales,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'Server Error',
    });
  }
});


router.get('/getAllSales', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    
    // Check if SaleCollection for the given month exists
    const salesTransaction = await Sale.find({ monthYear: monthYear._id })
      .populate('customer')
      .exec(); 

    if (!sales || sales.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'No sales found for the given month',
        data: [],
      });
    }
 

    return res.json({
      status: 'SUCCESS',
      data: sales,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'Server Error',
    });
  }
});

router.put('/updateSale', auth, async (req, res) => {
  const salesData = req.body;

  
  

  const session = await mongoose.startSession();
  session.startTransaction();

  try {


    const newSaleData = {
      fuelType:salesData.fuelType,
      driverName:salesData.driverName,
      plateNumber:salesData.plateNumber,
      saleDate:salesData.saleDate,
      billNumber:salesData.billNumber
    };

    if (salesData.pricePerTon !== '' && salesData.pricePerTon !== undefined && salesData.pricePerTon !== NaN) {
      newSaleData.pricePerTon = parseFloat(salesData.pricePerTon);
      newSaleData.pricePerLiter = null;
    }
    if (salesData.pricePerLiter !== '' && salesData.pricePerLiter !== undefined  && salesData.pricePerLiter !== NaN) {
      newSaleData.pricePerLiter = parseFloat(salesData.pricePerLiter);
      newSaleData.pricePerTon = null;
    }

    if (!isNaN(salesData.pricePerTon) && salesData.pricePerTon !== '' && salesData.pricePerTon !== undefined) {
      newSaleData.pricePerTon = parseFloat(salesData.pricePerTon);
      newSaleData.pricePerLiter = null;
    } else if (!isNaN(salesData.pricePerLiter) && salesData.pricePerLiter !== '' && salesData.pricePerLiter !== undefined) {
      newSaleData.pricePerLiter = parseFloat(salesData.pricePerLiter);
      newSaleData.pricePerTon = null;
    }

    newSaleData.customer = salesData.customerId;
    newSaleData.quantityInTons = !isNaN(salesData.quantityInTons) ? parseFloat(salesData.quantityInTons) : null;
    newSaleData.quantityInLiters = !isNaN(salesData.quantityInLiters) ? parseFloat(salesData.quantityInLiters) : null;


    const updateSale= await Sale.findByIdAndUpdate(
      {_id:salesData.saleData.sale._id},
      { $set: newSaleData },
      { new: true, useFindAndModify: false, session }
    );

    if(!updateSale)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }


      
    const newTransactionData = {
      customer:salesData.customerId,
      
      totalAmount:parseFloat(salesData.totalPrice),
      paidAmount:parseFloat(salesData.totalPaid),
      remainingAmount:parseFloat(salesData.remaining),
    };
     

    if(salesData.paymentType==='cash')
      {
        newTransactionData.date=salesData.saleDate
        newTransactionData.paymentType='cash'
        
      }else
      {
        newTransactionData.sarafi=salesData.sarafi
        newTransactionData.personName=salesData.personName
        newTransactionData.paymentType='sarafi'
        newTransactionData.receipt=salesData.receiptNumber
        newTransactionData.date=salesData.paymentDate
        newTransactionData.description=salesData.description
      }


      const updateTransaction= await Transaction.findByIdAndUpdate(
        {_id:salesData.saleData._id},
        { $set: newTransactionData },
        { new: true, useFindAndModify: false, session }
      );
  
      if(!updateTransaction)
        {
          await session.abortTransaction();
      session.endSession();
  
      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
        }


    if(salesData.paymentType==='cash' && salesData.saleData.paymentType==='cash' && salesData.customerId==salesData.saleData.customer._id)
      {
         if(salesData.totalPaid!=salesData.saleData.paidAmount)
          {
             const differance=parseFloat(salesData.totalPaid)-parseFloat(salesData.saleData.paidAmount)
             const roundedDifference = Math.round(differance * 100) / 100;
         
           const updateCash=  await CashAccount.findOneAndUpdate(
              {name: 'Main'},
              { $inc: { balance: parseFloat(roundedDifference) } },
              { new: true, session }
            );
            
            if(!updateCash)
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }


             
          }


          if(salesData.remaining !=salesData.saleData.remainingAmount )
            {
              const remainingDifferance=parseFloat(salesData.remaining)-parseFloat(salesData.saleData.remainingAmount)
              const roundedDifference = Math.round(remainingDifferance * 100) / 100;
         
              const updateCustomer= await Customer.findByIdAndUpdate(
                {_id:salesData.customerId},
                { $inc: { balance: -parseFloat(roundedDifference) } },
                { new: true, session }
              );
          
              if(!updateCustomer) 
                {
                  await session.abortTransaction();
              session.endSession();
          
              return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                }
            }


      }
   
   
   
      else  if(salesData.paymentType==='cash' && salesData.saleData.paymentType==='cash' && salesData.customerId!=salesData.saleData.customer._id)

        {
          if(salesData.totalPaid!=salesData.saleData.paidAmount)
           
            {
               const differance=parseFloat(salesData.totalPaid)-parseFloat(salesData.saleData.paidAmount)
               const roundedDifference = Math.round(differance * 100) / 100;
         
             const updateCash=  await CashAccount.findOneAndUpdate(
                {name: 'Main'},
                { $inc: { balance: parseFloat(roundedDifference) } },
                { new: true, session }
              );
              
              if(!updateCash)
                {
                  await session.abortTransaction();
              session.endSession();
          
              return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                }
  
  
               
            }



            const updateOldCustomer= await Customer.findByIdAndUpdate(
              {_id:salesData.saleData.customer._id},
              { $inc: { balance: parseFloat(salesData.saleData.remainingAmount) } },
              { new: true, session }
            );
        
            if(!updateOldCustomer)
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }


              const updateNewCustomer= await Customer.findByIdAndUpdate(
                {_id:salesData.customerId},
                { $inc: { balance: -parseFloat(salesData.remaining) } },
                { new: true, session }
              );
          
              if(!updateNewCustomer)
                {
                  await session.abortTransaction();
              session.endSession();
          
              return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                }
          }


          
          else   if(salesData.paymentType==='sarafi' && salesData.saleData.paymentType==='sarafi' && salesData.sarafi=== salesData.saleData.sarafi._id && salesData.customerId==salesData.saleData.customer._id)
            {

           



               if(salesData.totalPaid!=salesData.saleData.paidAmount)
                {
                   const differance=parseFloat(salesData.totalPaid)-parseFloat(salesData.saleData.paidAmount)
                   const roundedDifference = Math.round(differance * 100) / 100;
         
                 const updateSarafi=  await Sarafi.findOneAndUpdate(
                    {_id: salesData.sarafi},
                    { $inc: { balance: parseFloat(roundedDifference) } },
                    { new: true, session }
                  );
                  
                  if(!updateSarafi)
                    {
                      await session.abortTransaction();
                  session.endSession();
              
                  return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                    }
      
      
                   
                }
      
      
                if(salesData.remaining !=salesData.saleData.remainingAmount )
                  {
                    const remainingDifferance=parseFloat(salesData.remaining)-parseFloat(salesData.saleData.remainingAmount)
                    const roundedDifference = Math.round(remainingDifferance * 100) / 100;
         
                    const updateCustomer= await Customer.findByIdAndUpdate(
                      {_id:salesData.customerId},
                      { $inc: { balance: -parseFloat(roundedDifference) } },
                      { new: true, session }
                    );
                
                    if(!updateCustomer) 
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
                  }
      
      
            }

            else   if(salesData.paymentType==='sarafi' && salesData.saleData.paymentType==='sarafi' && salesData.sarafi=== salesData.saleData.sarafi._id && salesData.customerId!=salesData.saleData.customer._id)
              {
  
             
  
  
  
                 if(salesData.totalPaid!=salesData.saleData.paidAmount)
                  {
                     const differance=parseFloat(salesData.totalPaid)-parseFloat(salesData.saleData.paidAmount)
                     const roundedDifference = Math.round(differance * 100) / 100;
         
                   const updateSarafi=  await Sarafi.findOneAndUpdate(
                      {_id: salesData.sarafi},
                      { $inc: { balance: parseFloat(roundedDifference) } },
                      { new: true, session }
                    );
                    
                    if(!updateSarafi)
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
        
        
                     
                  }
        
        
                  const updateOldCustomer= await Customer.findByIdAndUpdate(
                    {_id:salesData.saleData.customer._id},
                    { $inc: { balance: parseFloat(salesData.saleData.remainingAmount) } },
                    { new: true, session }
                  );
              
                  if(!updateOldCustomer)
                    {
                      await session.abortTransaction();
                  session.endSession();
              
                  return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                    }
      
      
                    const updateNewCustomer= await Customer.findByIdAndUpdate(
                      {_id:salesData.customerId},
                      { $inc: { balance: -parseFloat(salesData.remaining) } },
                      { new: true, session }
                    );
                
                    if(!updateNewCustomer)
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
        
        
              }
           
              else   if(salesData.paymentType==='sarafi' && salesData.saleData.paymentType==='sarafi' && salesData.sarafi!= salesData.saleData.sarafi._id && salesData.customerId==salesData.saleData.customer._id)
                {
    
               
          
          
                    const updateOldSarafi= await Sarafi.findByIdAndUpdate(
                      {_id:salesData.saleData.sarafi._id},
                      { $inc: { balance: -parseFloat(salesData.saleData.paidAmount) } },
                      { new: true, session }
                    );
                
                    if(!updateOldSarafi)
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
        
        
                      const updateNewSarafi= await Sarafi.findByIdAndUpdate(
                        {_id:salesData.sarafi},
                        { $inc: { balance: parseFloat(salesData.totalPaid) } },
                        { new: true, session }
                      );
                  
                      if(!updateNewSarafi)
                        {
                          await session.abortTransaction();
                      session.endSession();
                  
                      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                        }
          

                        if(salesData.remaining !=salesData.saleData.remainingAmount )
                          {
                            const remainingDifferance=parseFloat(salesData.remaining)-parseFloat(salesData.saleData.remainingAmount)
                            const roundedDifference = Math.round(remainingDifferance * 100) / 100;
         
                            const updateCustomer= await Customer.findByIdAndUpdate(
                              {_id:salesData.customerId},
                              { $inc: { balance: -parseFloat(roundedDifference) } },
                              { new: true, session }
                            );
                        
                            if(!updateCustomer) 
                              {
                                await session.abortTransaction();
                            session.endSession();
                        
                            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                              }
                          }
              
          
                }
                else   if(salesData.paymentType==='sarafi' && salesData.saleData.paymentType==='sarafi' && salesData.sarafi!= salesData.saleData.sarafi._id && salesData.customerId!=salesData.saleData.customer._id)
                  {
      
                 
            
            
                      const updateOldSarafi= await Sarafi.findByIdAndUpdate(
                        {_id:salesData.saleData.sarafi._id},
                        { $inc: { balance: -parseFloat(salesData.saleData.paidAmount) } },
                        { new: true, session }
                      );
                  
                      if(!updateOldSarafi)
                        {
                          await session.abortTransaction();
                      session.endSession();
                  
                      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                        }
          
          
                        const updateNewSarafi= await Sarafi.findByIdAndUpdate(
                          {_id:salesData.sarafi},
                          { $inc: { balance: parseFloat(salesData.totalPaid) } },
                          { new: true, session }
                        );
                    
                        if(!updateNewSarafi)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
            
  
                          const updateOldCustomer= await Customer.findByIdAndUpdate(
                            {_id:salesData.saleData.customer._id},
                            { $inc: { balance: parseFloat(salesData.saleData.remainingAmount) } },
                            { new: true, session }
                          );
                      
                          if(!updateOldCustomer)
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
              
              
                            const updateNewCustomer= await Customer.findByIdAndUpdate(
                              {_id:salesData.customerId},
                              { $inc: { balance: -parseFloat(salesData.remaining) } },
                              { new: true, session }
                            );
                        
                            if(!updateNewCustomer)
                              {
                                await session.abortTransaction();
                            session.endSession();
                        
                            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                              }
                  }
         

                  
// update Stock

if(salesData.fuelType===salesData.saleData.sale.fuelType)
  {
   
    if(salesData.quantityInLiters!='' && salesData.quantityInLiters!=null &&  salesData.quantityInLiters!=undefined)
    {
      const oldQuantity=parseFloat(salesData.saleData.sale.quantityInLiters)
      const newQuantity=parseFloat(salesData.quantityInLiters)
     
      if(oldQuantity!==newQuantity)
       {

         const differance=oldQuantity-newQuantity;

         const roundedDifference = Math.round(differance * 100) / 100;
         
        
        const updateStock= await Stock.findOneAndUpdate(
          { fuelType: salesData.fuelType },  // corrected from {name: req.body.fuelType}
          { 
            $inc: { 
              quantityInLiters: parseFloat(roundedDifference), 
             
            } 
          },
          { new: true, session }
        );
         
         
         if(!updateStock)
           {
             await session.abortTransaction();
         session.endSession();
     
         return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
           }

           updateStock.quantityInLiters = Math.round(updateStock.quantityInLiters * 100) / 100;

// Save the rounded values back to the database
await updateStock.save({ session });
       }



    }

    if(salesData.quantityInTons!='' && salesData.quantityInTons!=null &&  salesData.quantityInTons!=undefined)
      {
        const oldQuantity=parseFloat(salesData.saleData.sale.quantityInTons)
        const newQuantity=parseFloat(salesData.quantityInTons)
       
        if(oldQuantity!==newQuantity)
         {

           const differance=oldQuantity-newQuantity;
           const roundedDifference = Math.round(differance * 100) / 100;
         
           
          const updateStock= await Stock.findOneAndUpdate(
            { fuelType: salesData.fuelType },  // corrected from {name: req.body.fuelType}
            { 
              $inc: { 
                quantityInTons: parseFloat(roundedDifference), 
               
              } 
            },
            { new: true, session }
          );
           
           
           if(!updateStock)
             {
               await session.abortTransaction();
           session.endSession();
       
           return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
             }

             updateStock.quantityInTons = Math.round(updateStock.quantityInTons * 100) / 100;

// Save the rounded values back to the database
await updateStock.save({ session });

             
         }
      }
  }else
  {

    if(salesData.quantityInLiters!='' && salesData.quantityInLiters!=null &&  salesData.quantityInLiters!=undefined)
      {

        const updateStockOld= await Stock.findOneAndUpdate(
          { fuelType: salesData.saleData.sale.fuelType },  // corrected from {name: req.body.fuelType}
          { 
            $inc: { 
              quantityInLiters: parseFloat(salesData.saleData.sale.quantityInLiters), 
             
            } 
          },
          { new: true, session }
        );
         
         
         if(!updateStockOld)
           {
             await session.abortTransaction();
         session.endSession();
     
         return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
           }

           updateStockOld.quantityInLiters = Math.round(updateStockOld.quantityInLiters * 100) / 100;

// Save the rounded values back to the database
await updateStockOld.save({ session });


           const updateStock= await Stock.findOneAndUpdate(
            { fuelType: salesData.fuelType },  // corrected from {name: req.body.fuelType}
            { 
              $inc: { 
                quantityInLiters: -parseFloat(salesData.quantityInLiters), 
              
              } 
            },
            { new: true, session }
          );
           
           
           if(!updateStock)
             {
               await session.abortTransaction();
           session.endSession();
       
           return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
             }

             updateStock.quantityInLiters = Math.round(updateStock.quantityInLiters * 100) / 100;

             // Save the rounded values back to the database
             await updateStock.save({ session });

      }else
      {
        const updateStockOld= await Stock.findOneAndUpdate(
          { fuelType: salesData.saleData.sale.fuelType },  // corrected from {name: req.body.fuelType}
          { 
            $inc: { 
              quantityInLiters: parseFloat(salesData.saleData.sale.quantityInLiters), 
             
            } 
          },
          { new: true, session }
        );
         
         
         if(!updateStockOld)
           {
             await session.abortTransaction();
         session.endSession();
     
         return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
           }

           updateStockOld.quantityInLiters = Math.round(updateStockOld.quantityInLiters * 100) / 100;

           // Save the rounded values back to the database
           await updateStockOld.save({ session });
           
           const updateStock= await Stock.findOneAndUpdate(
            { fuelType: salesData.fuelType },  // corrected from {name: req.body.fuelType}
            { 
              $inc: { 
                quantityInLiters: -parseFloat(salesData.saleData.sale.quantityInLiters), 
              
              } 
            },
            { new: true, session }
          );
           
           
           if(!updateStock)
             {
               await session.abortTransaction();
           session.endSession();
       
           return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
             }

             updateStock.quantityInLiters = Math.round(updateStock.quantityInLiters * 100) / 100;

             // Save the rounded values back to the database
             await updateStock.save({ session });
      }

      if(salesData.quantityInTons!='' && salesData.quantityInTons!=null &&  salesData.quantityInTons!=undefined)
        {

          const updateStockOld= await Stock.findOneAndUpdate(
            { fuelType: salesData.saleData.sale.fuelType },  // corrected from {name: req.body.fuelType}
            { 
              $inc: { 
                quantityInTons: parseFloat(salesData.saleData.sale.quantityInTons), 
               
              } 
            },
            { new: true, session }
          );
           
           
           if(!updateStockOld)
             {
               await session.abortTransaction();
           session.endSession();
       
           return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
             }

             updateStockOld.quantityInTons = Math.round(updateStockOld.quantityInTons * 100) / 100;

// Save the rounded values back to the database
await updateStockOld.save({ session });
  
             const updateStock= await Stock.findOneAndUpdate(
              { fuelType: salesData.fuelType },  // corrected from {name: req.body.fuelType}
              { 
                $inc: { 
                  quantityInTons: -parseFloat(salesData.quantityInTons), 
                
                } 
              },
              { new: true, session }
            );
             
             
             if(!updateStock)
               {
                 await session.abortTransaction();
             session.endSession();
         
             return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
               }

               updateStock.quantityInTons = Math.round(updateStock.quantityInTons * 100) / 100;

               // Save the rounded values back to the database
               await updateStock.save({ session });

        }else
        {
          const updateStockOld= await Stock.findOneAndUpdate(
            { fuelType: salesData.saleData.sale.fuelType },  // corrected from {name: req.body.fuelType}
            { 
              $inc: { 
                quantityInTons: parseFloat(salesData.saleData.sale.quantityInTons), 
               
              } 
            },
            { new: true, session }
          );
           
           
           if(!updateStockOld)
             {
               await session.abortTransaction();
           session.endSession();
       
           return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
             }


             updateStockOld.quantityInTons = Math.round(updateStockOld.quantityInTons * 100) / 100;

             // Save the rounded values back to the database
             await updateStockOld.save({ session });
  
             const updateStock= await Stock.findOneAndUpdate(
              { fuelType: salesData.fuelType },  // corrected from {name: req.body.fuelType}
              { 
                $inc: { 
                  quantityInTons: -parseFloat(salesData.saleData.sale.quantityInTons), 
                
                } 
              },
              { new: true, session }
            );
             
             
             if(!updateStock)
               {
                 await session.abortTransaction();
             session.endSession();
         
             return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
               }

               updateStock.quantityInTons = Math.round(updateStock.quantityInTons * 100) / 100;

               // Save the rounded values back to the database
               await updateStock.save({ session });
        }

  }




              // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد تغیر شو' });
       
        } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error updating sale:', error);
    res.status(500).json({ status: 'FAILED', message: 'سرور مشکل' });
  }
});




router.post('/deleteSale', auth, async (req, res) => {
  const { saleData } = req.body;

  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find SaleCollection by monthYear
    const deleteSale= await Sale.findByIdAndDelete(saleData.sale._id).session(session);

    if(!deleteSale)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
      }
    const updateCustomer= await Customer.findByIdAndUpdate(
      {_id: saleData.customer._id},
      { $inc: { balance: parseFloat(saleData.remainingAmount) } },
      { new: true, session }
    );

    if(!updateCustomer)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
      }

     if(saleData.paymentType==='cash')
      {
      const updateCash=  await CashAccount.findOneAndUpdate(
          {name: 'Main'},
          { $inc: { balance: -parseFloat(saleData.paidAmount) } },
          { new: true, session }
        );

        if(!updateCash)
          {
            await session.abortTransaction();
        session.endSession();
    
        return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
          }
    
      }else
      {
        const updateSarafi=await Sarafi.findByIdAndUpdate(
          {_id: saleData.sarafi._id},
          { $inc: { balance: -parseFloat(saleData.paidAmount) } },
          { new: true, session }
        );
        if(!updateSarafi)
          {
            await session.abortTransaction();
        session.endSession();
    
        return res.json({ status: 'FIELD', message: 'ریکارد ډلیت نه شو' });
          }
      }

    // Delete Sale Reference in CustomerPayment
    await Transaction.findByIdAndDelete(
    saleData._id
    ).session(session);


   const updatedStock= await Stock.findOneAndUpdate(
      { fuelType: saleData.sale.fuelType},  // corrected from {name: req.body.fuelType}
      { 
        $inc: { 
          quantityInLiters: parseFloat(saleData.sale.quantityInLiters), 
          quantityInTons: parseFloat(saleData.sale.quantityInTons) 
        } 
      },
      { new: true, session }
    );

    updatedStock.quantityInLiters = Math.round(updatedStock.quantityInLiters * 100) / 100;
updatedStock.quantityInTons = Math.round(updatedStock.quantityInTons * 100) / 100;

// Save the rounded values back to the database
await updatedStock.save({ session });


    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد ډلیت شو' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res
      .status(500)
      .json({ status: 'failed', message: 'Error processing request' });
  }
});







router.get('/purchaseStock', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Fetch the purchase collection for the specified monthYear
    const purchaseCollection = await PurchaseCollection.findOne({ monthYear });

    if (purchaseCollection) {
      res.json({ status: 'success', purchases: purchaseCollection.purchases });
    } else {
      res.json({
        status: 'success',
        message: 'خرید شتون نه لری',
        data: [],
      });
    }
  } catch (error) {
    console.error('Error fetching purchase stock:', error);
    res.json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

// Route to calculate sale stock for a specific monthYear
router.get('/saleStock', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Fetch the sale collection for the specified monthYear
    const saleCollection = await SaleCollection.findOne({ monthYear });

    if (saleCollection) {
      res.json({ status: 'success', sales: saleCollection.sales });
    } else {
      res.json({
        status: 'success',
        message: 'خرڅلاو شتون نه لری',
        data: [],
      });
    }
  } catch (error) {
    console.error('Error fetching sale stock:', error);
    res.json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.get('/getCustomerCashPaymentRecord/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;

    // Find the customer payments based on the customer ID
    const customerPayments = await CashAccount.find({
      customer: customerId,
    }).populate('sale')
    .exec();;

    
    // Check if the customer payments exist
    if (!customerPayments) {
      return res
        
        .json({ status: 'FIELD',data:[], message: 'Customer payments not found' });
    }
    

    

    res.json({ status: 'SUCCESS',data: customerPayments});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getCustomerSarafiPaymentRecord/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;

    // Find the customer payments based on the customer ID
    const customerPayments = await SarafiAcoount.find({
      customer: customerId,
    }).populate('sale')
    .populate('sarafi')
    .exec();

    
    // Check if the customer payments exist
    if (!customerPayments) {
      return res
       
        .json({ status: 'FIELD', data:[], message: 'Customer payments not found' });
    }
    

    

    res.json({ status: 'SUCCESS',data: customerPayments});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/getCutomerById/:customerId', async (req, res) => {
  try {
    
    const customerId = req.params.customerId;
    
    // Find the customer payments based on the customer ID
    const customer = await Customer.findById(customerId)

    
    // Check if the customer payments exist
    if (!customer) {
      return res
       
        .json({ status: 'FIELD', message: 'Customer not found' });
    }
    

    res.json({ status: 'SUCCESS',data: customer});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getCustomerLoanReceivable', async (req, res) => {
  try {
    // Aggregate to sum balances where balance > 0
    const result = await Customer.aggregate([
      {
        $match: { balance: { $lt: 0 } } // Filter documents with balance greater than 0
      },
      {
        $group: {
          _id: null, // Group all documents together
          totalBalance: { $sum: "$balance" } // Sum the balance field
        }
      }
    ]);

    // If no result, the total balance will be undefined, set it to 0
    const totalBalance = result.length > 0 ? result[0].totalBalance : 0;

  
    res.json({ status: 'SUCCESS', data:  totalBalance  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getCustomerLoanPayable', async (req, res) => {
  try {
    // Aggregate to sum balances where balance > 0
    const result = await Customer.aggregate([
      {
        $match: { balance: { $gt: 0 } } // Filter documents with balance greater than 0
      },
      {
        $group: {
          _id: null, // Group all documents together
          totalBalance: { $sum: "$balance" } // Sum the balance field
        }
      }
    ]);

    // If no result, the total balance will be undefined, set it to 0
    const totalBalance = result.length > 0 ? result[0].totalBalance : 0;

    
    res.json({ status: 'SUCCESS', data:  totalBalance  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getAllCustomerLoanReceivable', async (req, res) => {
  try {
   
    const customers = await Customer.find({ balance: { $lt: 0 } });

    res.json({ status: 'SUCCESS', data:  customers  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getAllCustomerLoanPayable', async (req, res) => {
  try {
   
    const customers = await Customer.find({ balance: { $gt: 0 } });

    res.json({ status: 'SUCCESS', data:  customers  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getSarafiById/:sarafiId', async (req, res) => {
  try {
    
    const sarafiId = req.params.sarafiId;
    
    // Find the customer payments based on the customer ID
    const sarafi = await Sarafi.findById(sarafiId)

    
    // Check if the customer payments exist
    if (!sarafi) {
      return res
       
        .json({ status: 'FIELD', message: 'Sarafi not found' });
    }
    

    res.json({ status: 'SUCCESS',data: sarafi});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/getSarafiLoanReceivable', async (req, res) => {
  try {
    // Aggregate to sum balances where balance > 0
    const result = await Sarafi.aggregate([
      {
        $match: { balance: { $gt: 0 } } // Filter documents with balance greater than 0
      },
      {
        $group: {
          _id: null, // Group all documents together
          totalBalance: { $sum: "$balance" } // Sum the balance field
        }
      }
    ]);

    // If no result, the total balance will be undefined, set it to 0
    const totalBalance = result.length > 0 ? result[0].totalBalance : 0;

  
    res.json({ status: 'SUCCESS', data:  totalBalance  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getAllSarafiLoanReceivable', async (req, res) => {
  try {
   
    const sarafis = await Sarafi.find({ balance: { $gt: 0 } });

    res.json({ status: 'SUCCESS', data:  sarafis  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getAllSarafiLoanPayable', async (req, res) => {
  try {
   
    const sarafis = await Sarafi.find({ balance: { $lt: 0 } });

    res.json({ status: 'SUCCESS', data:  sarafis  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getSarafiLoanPayable', async (req, res) => {
  try {
    // Aggregate to sum balances where balance > 0
    const result = await Sarafi.aggregate([
      {
        $match: { balance: { $lt: 0 } } // Filter documents with balance greater than 0
      },
      {
        $group: {
          _id: null, // Group all documents together
          totalBalance: { $sum: "$balance" } // Sum the balance field
        }
      }
    ]);

    // If no result, the total balance will be undefined, set it to 0
    const totalBalance = result.length > 0 ? result[0].totalBalance : 0;

    
    res.json({ status: 'SUCCESS', data:  totalBalance  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/getTotalSaleInEachMonth/:monthYear', auth, async (req, res) => {
  try {
    const { monthYear } = req.params;

    console.log(monthYear)
    // Perform aggregation to get total quantities for each fuel type
    const salesData = await Sale.aggregate([
      { $match: { monthYear: new mongoose.Types.ObjectId(monthYear) } },
      {
        $group: {
          _id: "$fuelType",
          totalQuantityInLiters: { $sum: "$quantityInLiters" },
          totalQuantityInTons: { $sum: "$quantityInTons" },
        },
      },
    ]);

    console.log(salesData)
    res.json({ status: 'SUCCESS', data: salesData });
  } catch (error) {
    console.error('Error fetching sale stock:', error);
    res.json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});


router.get('/getTransactionByCustomerIdAndMonthYear/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
   
    // Find the transactions based on the customer ID and monthYear
    const transactions = await Transaction.find({
      customer: customerId,
      // monthYear: monthYear,
    })
     .populate('sale') 
    .populate('sarafi')
    .exec(); ;

    // Check if transactions exist
    if (transactions.length === 0) {
      return res.status(404).json({ status: 'FAILED', data: [], message: 'Transactions not found' });
    }

    res.json({ status: 'SUCCESS', data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Internal Server Error' });
  }
});

router.get('/getTransactionBySarafiIdAndMonthYear/:sarafiId', async (req, res) => {
  try {
    const { sarafiId } = req.params;
    
   
    // Find the transactions based on the sarafiId ID and monthYear
    const transactions = await Transaction.find({
      sarafi: sarafiId,
      paymentType:'sarafi'
      // monthYear: monthYear,
    })
     
    .populate('customer')
    .exec(); ;

    // Check if transactions exist
    if (transactions.length === 0) {
      return res.status(404).json({ status: 'FAILED', data: [], message: 'Transactions not found' });
    }

    res.json({ status: 'SUCCESS', data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Internal Server Error' });
  }
});

router.get('/getTransactionOfCashPayment/:monthYear', async (req, res) => {
  try {
   
      const {monthYear}=req.params;
   
    
    // Find the transactions based on the sarafiId ID and monthYear
    const transactions = await Transaction.find({
      paymentType:'cash',
     
       monthYear: monthYear,
    })
    
    .populate('customer')
    .exec(); ;

    // Check if transactions exist
    if (transactions.length === 0) {
      return res.status(404).json({ status: 'FAILED', data: [], message: 'Transactions not found' });
    }

    res.json({ status: 'SUCCESS', data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Internal Server Error' });
  }
});


router.get('/getCash', async (req, res) => {
  try {
    
    // Find the cash account based on the name
    const cash = await CashAccount.findOne({ name: 'Main' });

   
    if (!cash) {
      return res.json({ status: 'FIELD', message: 'Cash account not found' });
    }

   

    res.json({ status: 'SUCCESS', data: cash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/getDateTime', (req, res) => {
  const currentDateTime = new Date();
  res.json({ dateTime: currentDateTime });
});

router.get('/average-cost-per-liter', async (req, res) => {
  try {
    // Calculate the average cost per liter for each fuel type
    const averageCostPipeline = [
      {
        $group: {
          _id: '$fuelType',
          totalCost: { $sum: '$totalPrice' },
          totalLiters: { $sum: '$quantityInLiters' },
          totalTons: { $sum: '$quantityInTons' }, // New line to sum quantityInTons
        },
      },
      {
        $project: {
          fuelType: '$_id',
          averageCostPerLiter: { $divide: ['$totalCost', '$totalLiters'] },
          averageCostPerTon: { $divide: ['$totalCost', '$totalTons'] }, // New line to calculate average cost per ton
          _id: 0, // Exclude _id field
        },
      },
    ];

    const averageCostResult = await Purchase.aggregate(
      averageCostPipeline
    ).exec();

    res.json({
      status: 'SUCCESS',
      averageCostPerLiter: averageCostResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'FAILED',
      message: 'Internal Server Error',
    });
  }
});




router.post('/addPayment', auth, async (req, res) => {
  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert relevant fields to appropriate types
    
      const {customer_id,
        collection,
        paidamount,
        transactionType,
        paymentType,
        personName,
        receiptNumber,
        description,
        sarafi,
        date}=req.body

   

    // Set the customer and monthYear fields
    const customer = customer_id;
    const monthYear = collection;

    const existingAccount = await CashAccount.findOne({ name: 'Main' });
    if (!existingAccount) {
      const cashAccount = new CashAccount({ name: 'Main', balance: 0 });
      await cashAccount.save({ session });
      
    }
   
    const newTransactionData = {
      customer,
      monthYear,
      transactionType,
      date,
      paymentType,
      description,
      totalAmount:parseFloat(paidamount),
      paidAmount:parseFloat(paidamount),
      remainingAmount:parseFloat(0),
    };
     
    if(paymentType==='sarafi')
      {
        newTransactionData.sarafi=sarafi
        newTransactionData.personName=personName
        newTransactionData.receipt=receiptNumber
      }
   

      const newTransaction = new Transaction(newTransactionData);

      const savedTransaction =  await newTransaction.save({ session });
   
        
      if(transactionType==='deposit')
        {
          await Customer.findByIdAndUpdate(
            {_id: customer},
            { $inc: { balance: parseFloat(paidamount) } },
            { new: true, session }
          );


          
    if(paymentType==='cash')
      {
         await CashAccount.findOneAndUpdate(
          {name: 'Main'},
          { $inc: { balance: parseFloat(paidamount) } },
          { new: true, session }
        );

      }else
      {
         await Sarafi.findByIdAndUpdate(
          {_id: sarafi},
          { $inc: { balance: parseFloat(paidamount) } },
          { new: true, session }
        );
      }



        }else if(transactionType==='withdrawal')
          {
            await Customer.findByIdAndUpdate(
              {_id: customer},
              { $inc: { balance: -parseFloat(paidamount) } },
              { new: true, session }
            );



            
    if(paymentType==='cash')
      {
         await CashAccount.findOneAndUpdate(
          {name: 'Main'},
          { $inc: { balance: -parseFloat(paidamount) } },
          { new: true, session }
        );

      }else
      {
         await Sarafi.findByIdAndUpdate(
          {_id: sarafi},
          { $inc: { balance: -parseFloat(paidamount) } },
          { new: true, session }
        );
      }




          }
             
    
 

            

    await session.commitTransaction();
    session.endSession();

    // Respond with success message and data
    res.status(201).json({
      status: 'SUCCESS',
      message: 'معلومات ثبت شو',
    
    });
    // Commit the transaction
    
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error adding sale:', error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی'
    });
  }
});

router.delete(
  '/deleteCustomerAccountRecord/:customerId/:recordId',
  auth,
  async (req, res) => {
    const { customerId, recordId } = req.params;

    try {
      // Find the customer payment by ID
      const customerPayment = await CashAccount.findOne({
        customer: customerId,
      });

      // Check if customer payment exists
      if (!customerPayment) {
        return res.json({ status: 'FAILED', message: 'معلومات پیدا نه شو' });
      }

      // Find the index of the payment record to delete
      const recordIndex = customerPayment.payments.findIndex(
        (payment) => payment._id.toString() === recordId
      );

      // Check if the record with the given ID was found
      if (recordIndex === -1) {
        return res.json({ status: 'FAILED', message: 'معلومات پیدا نه شو' });
      }

      // Remove the payment record from the payments array
      customerPayment.payments.splice(recordIndex, 1);

      // Save the updated customer payment
      await customerPayment.save();

      return res.json({ status: 'SUCCESS', message: 'ریکارد ډلیت شو' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);


router.put('/updateCustomerAccountRecord', auth, async (req, res) => {
  const accountData = req.body;

  console.log('acc',accountData)

  const session = await mongoose.startSession();
  session.startTransaction();

  try {



    if(accountData.paymentType==='cash' && accountData.transactionType==='deposit' && accountData.selectedRowData.transactionType==='deposit')
    {

 const newTransactionData = {
  paidAmount:accountData.paidAmount,
  totalAmount:accountData.paidAmount,
  date:accountData.date,
  description:accountData.description
     
    };


    const updateTransaction= await Transaction.findByIdAndUpdate(
      {_id:accountData.selectedRowData._id},
      { $set: newTransactionData },
      { new: true, useFindAndModify: false, session }
    );

    if(!updateTransaction)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }


      if(parseFloat(accountData.paidAmount)!=parseFloat(accountData.selectedRowData.paidAmount))
        {
           const differance=parseFloat(accountData.paidAmount)-parseFloat(accountData.selectedRowData.paidAmount)
           const roundedDifference = Math.round(differance * 100) / 100;
         
         const updateCash=  await CashAccount.findOneAndUpdate(
            {name: 'Main'},
            { $inc: { balance: parseFloat(roundedDifference) } },
            { new: true, session }
          );
          
          if(!updateCash)
            {
              await session.abortTransaction();
          session.endSession();
      
          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
            }



            
            const updateCustomer= await Customer.findByIdAndUpdate(
              {_id:accountData.selectedRowData.customer},
              { $inc: { balance: parseFloat(roundedDifference) } },
              { new: true, session }
            );
        
            if(!updateCustomer) 
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }
           
        }


    }

    else  if(accountData.paymentType==='cash' && accountData.transactionType==='withdrawal' && accountData.selectedRowData.transactionType==='withdrawal')
    {

 const newTransactionData = {
  paidAmount:accountData.paidAmount,
  totalAmount:accountData.paidAmount,
  date:accountData.date,
  description:accountData.description
     
    };


    const updateTransaction= await Transaction.findByIdAndUpdate(
      {_id:accountData.selectedRowData._id},
      { $set: newTransactionData },
      { new: true, useFindAndModify: false, session }
    );

    if(!updateTransaction)
      {
        await session.abortTransaction();
    session.endSession();

    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
      }


      if(parseFloat(accountData.paidAmount)!=parseFloat(accountData.selectedRowData.paidAmount))
        {
           const differance=parseFloat(accountData.paidAmount)-parseFloat(accountData.selectedRowData.paidAmount)
           const roundedDifference = Math.round(differance * 100) / 100;
         
         const updateCash=  await CashAccount.findOneAndUpdate(
            {name: 'Main'},
            { $inc: { balance: -parseFloat(roundedDifference) } },
            { new: true, session }
          );
          
          if(!updateCash)
            {
              await session.abortTransaction();
          session.endSession();
      
          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
            }



            
            const updateCustomer= await Customer.findByIdAndUpdate(
              {_id:accountData.selectedRowData.customer},
              { $inc: { balance: -parseFloat(roundedDifference) } },
              { new: true, session }
            );
        
            if(!updateCustomer) 
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }
           
        }


    }

   else if(accountData.paymentType==='cash' && accountData.transactionType==='withdrawal' && accountData.selectedRowData.transactionType==='deposit')
      {
  
   const newTransactionData = {
    paidAmount:accountData.paidAmount,
    totalAmount:accountData.paidAmount,
    date:accountData.date,
    description:accountData.description,
    transactionType:accountData.transactionType
       
      };
  
  
      const updateTransaction= await Transaction.findByIdAndUpdate(
        {_id:accountData.selectedRowData._id},
        { $set: newTransactionData },
        { new: true, useFindAndModify: false, session }
      );
  
      if(!updateTransaction)
        {
          await session.abortTransaction();
      session.endSession();
  
      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
        }
  
  
        
             
           const updateCash=  await CashAccount.findOneAndUpdate(
              {name: 'Main'},
              { $inc: { balance: -parseFloat(accountData.paidAmount) } },
              { new: true, session }
            );
            
            if(!updateCash)
              {
                await session.abortTransaction();
            session.endSession();
        
            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
              }
  
  
  
              
              const updateCustomerOld= await Customer.findByIdAndUpdate(
                {_id:accountData.selectedRowData.customer},
                { $inc: { balance: -parseFloat(accountData.selectedRowData.paidAmount) } },
                { new: true, session }
              );
          
              if(!updateCustomerOld) 
                {
                  await session.abortTransaction();
              session.endSession();
          
              return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                }

                const updateCustomer= await Customer.findByIdAndUpdate(
                  {_id:accountData.selectedRowData.customer},
                  { $inc: { balance: -parseFloat(accountData.paidAmount) } },
                  { new: true, session }
                );
            
                if(!updateCustomer) 
                  {
                    await session.abortTransaction();
                session.endSession();
            
                return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                  }
             
          
  
  
      }
      
      else if(accountData.paymentType==='cash' && accountData.transactionType==='deposit' && accountData.selectedRowData.transactionType==='withdrawal')
        {
    
     const newTransactionData = {
      paidAmount:accountData.paidAmount,
      totalAmount:accountData.paidAmount,
      date:accountData.date,
      description:accountData.description,
      transactionType:accountData.transactionType
         
        };
    
    
        const updateTransaction= await Transaction.findByIdAndUpdate(
          {_id:accountData.selectedRowData._id},
          { $set: newTransactionData },
          { new: true, useFindAndModify: false, session }
        );
    
        if(!updateTransaction)
          {
            await session.abortTransaction();
        session.endSession();
    
        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
          }
    
    
          
               
             const updateCash=  await CashAccount.findOneAndUpdate(
                {name: 'Main'},
                { $inc: { balance: parseFloat(accountData.paidAmount) } },
                { new: true, session }
              );
              
              if(!updateCash)
                {
                  await session.abortTransaction();
              session.endSession();
          
              return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                }
    
    
    
                
                const updateCustomerOld= await Customer.findByIdAndUpdate(
                  {_id:accountData.selectedRowData.customer},
                  { $inc: { balance: parseFloat(accountData.selectedRowData.paidAmount) } },
                  { new: true, session }
                );
            
                if(!updateCustomerOld) 
                  {
                    await session.abortTransaction();
                session.endSession();
            
                return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                  }
  
                  const updateCustomer= await Customer.findByIdAndUpdate(
                    {_id:accountData.selectedRowData.customer},
                    { $inc: { balance: parseFloat(accountData.paidAmount) } },
                    { new: true, session }
                  );
              
                  if(!updateCustomer) 
                    {
                      await session.abortTransaction();
                  session.endSession();
              
                  return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                    }
               
            
    
    
        }

        else  if(accountData.paymentType==='sarafi' && accountData.transactionType==='deposit' && accountData.selectedRowData.transactionType==='deposit')
          {
           

            if(accountData.sarafi._id ==accountData.selectedRowData.sarafi._id)
            {
         
              const newTransactionData = {
                paidAmount:accountData.paidAmount,
                totalAmount:accountData.paidAmount,
                date:accountData.date,
                description:accountData.description,
                receipt: accountData.receipt,
                personName:accountData.personName
                  };

                  const updateTransaction= await Transaction.findByIdAndUpdate(
                    {_id:accountData.selectedRowData._id},
                    { $set: newTransactionData },
                    { new: true, useFindAndModify: false, session }
                  );
              
                  if(!updateTransaction)
                    {
                      await session.abortTransaction();
                  session.endSession();
              
                  return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                    }



                    
            if(parseFloat(accountData.paidAmount)!=parseFloat(accountData.selectedRowData.paidAmount))
              {
                 const differance=parseFloat(accountData.paidAmount)-parseFloat(accountData.selectedRowData.paidAmount)
                 const roundedDifference = Math.round(differance * 100) / 100;
         
               const updateSarafi=  await Sarafi.findOneAndUpdate(
                  {_id: accountData.sarafi._id},
                  { $inc: { balance: parseFloat(roundedDifference) } },
                  { new: true, session }
                );
                
                if(!updateSarafi)
                  {
                    await session.abortTransaction();
                session.endSession();
            
                return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                  }
      
      
      
                  
                  const updateCustomer= await Customer.findByIdAndUpdate(
                    {_id:accountData.selectedRowData.customer},
                    { $inc: { balance: parseFloat(roundedDifference) } },
                    { new: true, session }
                  );
              
                  if(!updateCustomer) 
                    {
                      await session.abortTransaction();
                  session.endSession();
              
                  return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                    }
                 
              }
      

            }
            else  
              {
           
              
                const newTransactionData = {
                  paidAmount:accountData.paidAmount,
                  totalAmount:accountData.paidAmount,
                  date:accountData.date,
                  description:accountData.description,
                  receipt: accountData.receipt,
                  personName:accountData.personName,
                  sarafi:accountData.sarafi
                    };
  
                    const updateTransaction= await Transaction.findByIdAndUpdate(
                      {_id:accountData.selectedRowData._id},
                      { $set: newTransactionData },
                      { new: true, useFindAndModify: false, session }
                    );
                
                    if(!updateTransaction)
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
  
  
  
                   
                      const updateSarafiOld=  await Sarafi.findOneAndUpdate(
                        {_id: accountData.selectedRowData.sarafi._id},
                        { $inc: { balance: -parseFloat(accountData.selectedRowData.paidAmount) } },
                        { new: true, session }
                      );
                      
                      if(!updateSarafiOld)
                        {
                          await session.abortTransaction();
                      session.endSession();
                  
                      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                        }
            
            
                       
                        
                      const updateSarafi=  await Sarafi.findOneAndUpdate(
                        {_id: accountData.sarafi},
                        { $inc: { balance: parseFloat(accountData.paidAmount) } },
                        { new: true, session }
                      );
                      
                      console.log('new sarafi',updateSarafi)
                        
                      if(!updateSarafi)
                        {
                          await session.abortTransaction();
                      session.endSession();
                  
                      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                        }
            
                        
                    
        
  
          
                        if(parseFloat(accountData.paidAmount)!=parseFloat(accountData.selectedRowData.paidAmount))
                          {

                            
                             const differance=parseFloat(accountData.paidAmount)-parseFloat(accountData.selectedRowData.paidAmount)
                             const roundedDifference = Math.round(differance * 100) / 100;
         
                        const updateCustomer= await Customer.findByIdAndUpdate(
                          {_id:accountData.selectedRowData.customer},
                          { $inc: { balance: parseFloat(roundedDifference) } },
                          { new: true, session }
                        );
                    
                        if(!updateCustomer) 
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
                        }
          
          
          
          
                      }


      
      
      
      
         
      
      
      
          }

          else  if(accountData.paymentType==='sarafi' && accountData.transactionType==='withdrawal' && accountData.selectedRowData.transactionType==='withdrawal')
            {
             
  
              if(accountData.sarafi._id ==accountData.selectedRowData.sarafi._id)
              {
           
                const newTransactionData = {
                  paidAmount:accountData.paidAmount,
                  totalAmount:accountData.paidAmount,
                  date:accountData.date,
                  description:accountData.description,
                  receipt: accountData.receipt,
                  personName:accountData.personName
                    };
  
                    const updateTransaction= await Transaction.findByIdAndUpdate(
                      {_id:accountData.selectedRowData._id},
                      { $set: newTransactionData },
                      { new: true, useFindAndModify: false, session }
                    );
                
                    if(!updateTransaction)
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
  
  
  
                      
              if(parseFloat(accountData.paidAmount)!=parseFloat(accountData.selectedRowData.paidAmount))
                {
                   const differance=parseFloat(accountData.paidAmount)-parseFloat(accountData.selectedRowData.paidAmount)
                   const roundedDifference = Math.round(differance * 100) / 100;
         
                 const updateSarafi=  await Sarafi.findOneAndUpdate(
                    {_id: accountData.sarafi._id},
                    { $inc: { balance: -parseFloat(roundedDifference) } },
                    { new: true, session }
                  );
                  
                  if(!updateSarafi)
                    {
                      await session.abortTransaction();
                  session.endSession();
              
                  return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                    }
        
        
        
                    
                    const updateCustomer= await Customer.findByIdAndUpdate(
                      {_id:accountData.selectedRowData.customer},
                      { $inc: { balance: -parseFloat(roundedDifference) } },
                      { new: true, session }
                    );
                
                    if(!updateCustomer) 
                      {
                        await session.abortTransaction();
                    session.endSession();
                
                    return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                      }
                   
                }
        
  
              }
              else  
                {
             
                
                  const newTransactionData = {
                    paidAmount:accountData.paidAmount,
                    totalAmount:accountData.paidAmount,
                    date:accountData.date,
                    description:accountData.description,
                    receipt: accountData.receipt,
                    personName:accountData.personName,
                    sarafi:accountData.sarafi
                      };
    
                      const updateTransaction= await Transaction.findByIdAndUpdate(
                        {_id:accountData.selectedRowData._id},
                        { $set: newTransactionData },
                        { new: true, useFindAndModify: false, session }
                      );
                  
                      if(!updateTransaction)
                        {
                          await session.abortTransaction();
                      session.endSession();
                  
                      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                        }
    
    
    
                     
                        const updateSarafiOld=  await Sarafi.findOneAndUpdate(
                          {_id: accountData.selectedRowData.sarafi._id},
                          { $inc: { balance: parseFloat(accountData.selectedRowData.paidAmount) } },
                          { new: true, session }
                        );
                        
                        if(!updateSarafiOld)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
              
              
                         
                          
                        const updateSarafi=  await Sarafi.findOneAndUpdate(
                          {_id: accountData.sarafi},
                          { $inc: { balance: -parseFloat(accountData.paidAmount) } },
                          { new: true, session }
                        );
                        
                        console.log('new sarafi',updateSarafi)
                          
                        if(!updateSarafi)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
              
                          
                      
          
    
            
                          if(parseFloat(accountData.paidAmount)!=parseFloat(accountData.selectedRowData.paidAmount))
                            {
  
                              
                               const differance=parseFloat(accountData.paidAmount)-parseFloat(accountData.selectedRowData.paidAmount)
                               const roundedDifference = Math.round(differance * 100) / 100;
         
                          const updateCustomer= await Customer.findByIdAndUpdate(
                            {_id:accountData.selectedRowData.customer},
                            { $inc: { balance: -parseFloat(roundedDifference) } },
                            { new: true, session }
                          );
                      
                          if(!updateCustomer) 
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
                          }
            
            
            
            
                        }
  
  
        
        
        
        
           
        
        
        
            }

            else  if(accountData.paymentType==='sarafi' && accountData.transactionType==='deposit' && accountData.selectedRowData.transactionType==='withdrawal')
              {
               
    
                if(accountData.sarafi._id ==accountData.selectedRowData.sarafi._id)
                {
             
                  const newTransactionData = {
                    paidAmount:accountData.paidAmount,
                    totalAmount:accountData.paidAmount,
                    date:accountData.date,
                    description:accountData.description,
                    receipt: accountData.receipt,
                    personName:accountData.personName,
                    transactionType:accountData.transactionType
                      };
    
                      const updateTransaction= await Transaction.findByIdAndUpdate(
                        {_id:accountData.selectedRowData._id},
                        { $set: newTransactionData },
                        { new: true, useFindAndModify: false, session }
                      );
                  
                      if(!updateTransaction)
                        {
                          await session.abortTransaction();
                      session.endSession();
                  
                      return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                        }
    
    


                        const updateSarafiOld=  await Sarafi.findOneAndUpdate(
                          {_id: accountData.sarafi._id},
                          { $inc: { balance: parseFloat(accountData.selectedRowData.paidAmount) } },
                          { new: true, session }
                        );
                        
                        if(!updateSarafiOld)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
              
              
    
                          
                        const updateSarafi=  await Sarafi.findOneAndUpdate(
                          {_id: accountData.sarafi._id},
                          { $inc: { balance: parseFloat(accountData.paidAmount) } },
                          { new: true, session }
                        );
                        
                        if(!updateSarafi)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
              

                        
                        
              
    
                }
                else  
                  {
               
                    const newTransactionData = {
                      paidAmount:accountData.paidAmount,
                      totalAmount:accountData.paidAmount,
                      date:accountData.date,
                      description:accountData.description,
                      receipt: accountData.receipt,
                      personName:accountData.personName,
                      transactionType:accountData.transactionType,
                      sarafi:accountData.sarafi
                        };
                  
                    
      
                        const updateTransaction= await Transaction.findByIdAndUpdate(
                          {_id:accountData.selectedRowData._id},
                          { $set: newTransactionData },
                          { new: true, useFindAndModify: false, session }
                        );
                    
                        if(!updateTransaction)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
      
      
      
                       
                          const updateSarafiOld=  await Sarafi.findOneAndUpdate(
                            {_id: accountData.selectedRowData.sarafi._id},
                            { $inc: { balance: parseFloat(accountData.selectedRowData.paidAmount) } },
                            { new: true, session }
                          );
                          
                          if(!updateSarafiOld)
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
                
                
                           
                            
                          const updateSarafi=  await Sarafi.findOneAndUpdate(
                            {_id: accountData.sarafi},
                            { $inc: { balance: parseFloat(accountData.paidAmount) } },
                            { new: true, session }
                          );
                          
                          console.log('new sarafi',updateSarafi)
                            
                          if(!updateSarafi)
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
                
                            
                        
            
      
              
                       
              
              
                          }
    
    
          
                          const updateCustomerOld= await Customer.findByIdAndUpdate(
                            {_id:accountData.selectedRowData.customer},
                            { $inc: { balance: parseFloat(accountData.selectedRowData.paidAmount) } },
                            { new: true, session }
                          );
                      
                          if(!updateCustomerOld) 
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
          
                            
                          const updateCustomer= await Customer.findByIdAndUpdate(
                            {_id:accountData.selectedRowData.customer},
                            { $inc: { balance: parseFloat(accountData.paidAmount) } },
                            { new: true, session }
                          );
                      
                          if(!updateCustomer) 
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
             
          
          
          
              }

              else  if(accountData.paymentType==='sarafi' && accountData.transactionType==='withdrawal' && accountData.selectedRowData.transactionType==='deposit')
                {
                 
      
                  if(accountData.sarafi._id ==accountData.selectedRowData.sarafi._id)
                  {
               
                    const newTransactionData = {
                      paidAmount:accountData.paidAmount,
                      totalAmount:accountData.paidAmount,
                      date:accountData.date,
                      description:accountData.description,
                      receipt: accountData.receipt,
                      personName:accountData.personName,
                      transactionType:accountData.transactionType
                        };
      
                        const updateTransaction= await Transaction.findByIdAndUpdate(
                          {_id:accountData.selectedRowData._id},
                          { $set: newTransactionData },
                          { new: true, useFindAndModify: false, session }
                        );
                    
                        if(!updateTransaction)
                          {
                            await session.abortTransaction();
                        session.endSession();
                    
                        return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                          }
      
      
  
  
                          const updateSarafiOld=  await Sarafi.findOneAndUpdate(
                            {_id: accountData.sarafi._id},
                            { $inc: { balance: -parseFloat(accountData.selectedRowData.paidAmount) } },
                            { new: true, session }
                          );
                          
                          if(!updateSarafiOld)
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
                
                
      
                            
                          const updateSarafi=  await Sarafi.findOneAndUpdate(
                            {_id: accountData.sarafi._id},
                            { $inc: { balance: -parseFloat(accountData.paidAmount) } },
                            { new: true, session }
                          );
                          
                          if(!updateSarafi)
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
                
  
                          
                          
                
      
                  }
                  else  
                    {
                 
                      const newTransactionData = {
                        paidAmount:accountData.paidAmount,
                        totalAmount:accountData.paidAmount,
                        date:accountData.date,
                        description:accountData.description,
                        receipt: accountData.receipt,
                        personName:accountData.personName,
                        transactionType:accountData.transactionType,
                        sarafi:accountData.sarafi
                          };
                    
                      
        
                          const updateTransaction= await Transaction.findByIdAndUpdate(
                            {_id:accountData.selectedRowData._id},
                            { $set: newTransactionData },
                            { new: true, useFindAndModify: false, session }
                          );
                      
                          if(!updateTransaction)
                            {
                              await session.abortTransaction();
                          session.endSession();
                      
                          return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                            }
        
        
        
                         
                            const updateSarafiOld=  await Sarafi.findOneAndUpdate(
                              {_id: accountData.selectedRowData.sarafi._id},
                              { $inc: { balance: -parseFloat(accountData.selectedRowData.paidAmount) } },
                              { new: true, session }
                            );
                            
                            if(!updateSarafiOld)
                              {
                                await session.abortTransaction();
                            session.endSession();
                        
                            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                              }
                  
                  
                             
                              
                            const updateSarafi=  await Sarafi.findOneAndUpdate(
                              {_id: accountData.sarafi},
                              { $inc: { balance: -parseFloat(accountData.paidAmount) } },
                              { new: true, session }
                            );
                            
                            console.log('new sarafi',updateSarafi)
                              
                            if(!updateSarafi)
                              {
                                await session.abortTransaction();
                            session.endSession();
                        
                            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                              }
                  
                              
                          
              
        
                
                         
                
                
                            }
      
      
            
                            const updateCustomerOld= await Customer.findByIdAndUpdate(
                              {_id:accountData.selectedRowData.customer},
                              { $inc: { balance: -parseFloat(accountData.selectedRowData.paidAmount) } },
                              { new: true, session }
                            );
                        
                            if(!updateCustomerOld) 
                              {
                                await session.abortTransaction();
                            session.endSession();
                        
                            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                              }
            
                              
                            const updateCustomer= await Customer.findByIdAndUpdate(
                              {_id:accountData.selectedRowData.customer},
                              { $inc: { balance: -parseFloat(accountData.paidAmount) } },
                              { new: true, session }
                            );
                        
                            if(!updateCustomer) 
                              {
                                await session.abortTransaction();
                            session.endSession();
                        
                            return res.json({ status: 'FIELD', message: 'ریکارد تغیر نه شو' });
                              }
               
            
            
            
                }


            
              // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'SUCCESS', message: 'ریکارد تغیر شو' });
       
        } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error('Error updating sale:', error);
    res.status(500).json({ status: 'FAILED', message: 'سرور مشکل' });
  }
});

router.post('/addManagmentCollection', async (req, res) => {
  try {
    const { formattedDate } = req.body;

    const existingCollection = await CollectionsDateManagement.findOne({
      collectionName: formattedDate,
    });

    if (existingCollection) {
      return res.json({ status: 'FAILED', message: 'ریکارد موجود دی' });
    }


    const newCollection = new CollectionsDateManagement({
      collectionName: formattedDate,
    });


    await newCollection.save();

    res.json({
      status: 'SUCCESS',
      message: 'ریکارد ثبت شو',
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.get('/getAvailableCollections', auth, async (req, res) => {
  try {
    let collections = await CollectionsDateManagement.find();
    if (collections.length === 0) {
      return res.json({
        status: 'FAILED',
        message: ' ټولګه شتون نه لری',
      });
    } else {
      
      return res.json({
        status: 'SUCCESS',
        data:collections
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});



router.get('/getStock', auth, async (req, res) => {
  try {
    

    
    // Check if SaleCollection for the given month exists
    const stock = await Stock.find()
    

    if (!stock || stock.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'stock not found',
        data: [],
      });
    }
    console.log(stock)

    return res.json({
      status: 'SUCCESS',
      data: stock,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'Server Error',
    });
  }
});



router.get('/sales-data', async (req, res) => {
  try {
    const salesData = await Sale.aggregate([
      {
        $group: {
          _id: '$monthYear',
          totalSales: { $sum: '$quantityInLiters' } // Or '$quantityInTons' based on your requirement
        }
      },
      {
        $lookup: {
          from: 'collectionsdatemanagements', // The collection name of your 'CollectionsDateManagement' model
          localField: '_id',
          foreignField: '_id',
          as: 'monthYearDetails'
        }
      },
      {
        $unwind: '$monthYearDetails'
      },
      {
        $project: {
          _id: 0,
          monthYear: '$monthYearDetails.collectionName', // Assuming 'collectionName' is the field representing the month and year
          totalSales: 1
        }
      }
    ]);
    return res.json({
      status: 'SUCCESS',
      data: salesData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
