const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../lib/models');
const OTP = require('../../lib/otpModel');
const Employee = require('../../lib/employee');
const Supplier = require('../../lib/supplier'); // Import the OTP model
const Customer = require('../../lib/customer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { Purchase, PurchaseCollection } = require('../../lib/purchase');
const { Sale, SaleCollection } = require('../../lib/sale');
const { Expense, ExpenseCollection } = require('../../lib/expense');
const { Salary, SalaryCollection } = require('../../lib/salary');
const CustomerPayment = require('../../lib/customerPayment');
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

router.post('/addEmployee', auth, async (req, res) => {
  try {
    const { name, NIC, contactNumber, position, joinDate, salary, address } =
      req.body;

    // Convert salary to a number (integer)
    const salaryAsInt = parseInt(salary, 10);

    // Create a new Employee instance
    const newEmployee = new Employee({
      name,
      NIC,
      contactNumber,
      position,
      joinDate,
      salary: salaryAsInt,
      address,
    });

    // Save the new employee to the database
    await newEmployee.save();

    // Send a success response
    res.json({ status: 'SUCCESS', message: 'Employee added successfully!' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
  }
});

router.get('/getAllEmployees', auth, async (req, res) => {
  try {
    let employees = await Employee.find();
    if (employees.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'There are no employee!',
      });
    } else {
      return res.json(employees);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'Server Error!',
    });
  }
});

router.put('/updateEmployee', auth, async (req, res) => {
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

    const updateEmployee = await Employee.findOneAndUpdate(
      { _id: cleanedData._id },
      { $set: cleanedData },
      { new: true, useFindAndModify: false }
    );

    if (updateEmployee) {
      res.json({ status: 'success', employee: updateEmployee });
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

router.post('/addPurchase', auth, async (req, res) => {
  try {
    console.log('purchase', req.body);
    // Convert quantityInTons, quantityInLiters, and totalPrice to Numbers
    req.body.quantityInTons = parseFloat(req.body.quantityInTons);
    req.body.quantityInLiters = parseFloat(req.body.quantityInLiters);
    req.body.totalPrice = parseFloat(req.body.totalPrice);

    const selectedCollection = req.body.selectedCollection; // Extract month and year from the purchase date

    // Check if PurchaseCollection for the given month exists, create one if not
    let purchaseCollection = await PurchaseCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!purchaseCollection) {
      // If PurchaseCollection doesn't exist, create a new one with a default status of 'open'
      purchaseCollection = new PurchaseCollection({
        monthYear: selectedCollection,
        status: 'open',
        purchases: [],
      });
    }

    // Create a new Purchase instance using the Purchase model
    const newPurchase = new Purchase(req.body);

    // Add the new purchase to the purchases array in the PurchaseCollection
    purchaseCollection.purchases.push(newPurchase);

    // Save the updated PurchaseCollection to the database
    await purchaseCollection.save();

    res.status(201).json({ status: 'SUCCESS', message: 'معلومات ثبت شو' });

    // Update stock based on the fuel type (you may need to implement this part)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
    });
  }
});

router.get('/getAllPurchases', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Check if PurchaseCollection for the given month exists
    const purchaseCollection = await PurchaseCollection.findOne({ monthYear });

    if (!purchaseCollection) {
      return res.json({
        status: 'FAILED',
        message: 'خرید شتون نه لری',
        data: [],
      });
    }

    // Retrieve all purchases for the specified PurchaseCollection
    const purchases = purchaseCollection.purchases;

    if (purchases.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'خرید شتون نه لری',
        data: [],
      });
    }

    return res.json(purchases);
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

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(purchaseData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // Construct the update query dynamically based on the cleanedData

    // Create an empty object to store the dynamically constructed update data
    const updateData = {};

    // Iterate over the keys in cleanedData
    for (const key of Object.keys(cleanedData)) {
      // Construct the path for each field in the purchases array
      // For example, if key is 'driverName', the path will be 'purchases.$.driverName'
      updateData[`purchases.$.${key}`] = cleanedData[key];
    }

    // Use findOneAndUpdate to find the specific purchase and update only the specified fields
    const updatePurchase = await PurchaseCollection.findOneAndUpdate(
      {
        monthYear: purchaseData.selectedCollection,
        'purchases._id': purchaseData._id,
      },
      { $set: updateData },
      { new: true, useFindAndModify: false }
    );

    if (updatePurchase) {
      res.json({ status: 'success', supplier: updatePurchase });
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

// Backend route
router.delete('/deletePurchase/:selectedCollection/:id', async (req, res) => {
  const { selectedCollection, id } = req.params;

  try {
    // Find the PurchaseCollection with the given monthYear
    const purchaseCollection = await PurchaseCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!purchaseCollection) {
      return res.json({
        status: 'FIELD',
        message: 'PurchaseCollection not found',
      });
    }

    // Find the index of the purchase with the specified id in the purchases array
    const purchaseIndex = purchaseCollection.purchases.findIndex(
      (purchase) => purchase._id.toString() === id
    );

    if (purchaseIndex === -1) {
      return res.json({ status: 'FIELD', message: 'Purchase not found' });
    }

    // Remove the purchase from the purchases array
    purchaseCollection.purchases.splice(purchaseIndex, 1);

    // Save the updated PurchaseCollection to the database
    await purchaseCollection.save();

    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

router.post('/addExpense', auth, async (req, res) => {
  try {
    // Convert quantityInTons, quantityInLiters, and totalPrice to Numbers
    req.body.amount = parseFloat(req.body.amount);

    const selectedCollection = req.body.selectedCollection; // Extract month and year from the purchase date

    // Check if PurchaseCollection for the given month exists, create one if not
    let expenseCollection = await ExpenseCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!expenseCollection) {
      // If PurchaseCollection doesn't exist, create a new one with a default status of 'open'
      expenseCollection = new ExpenseCollection({
        monthYear: selectedCollection,
        status: 'open',
        expenses: [],
      });
    }

    // Create a new Purchase instance using the Purchase model
    const newExpense = new Expense(req.body);

    // Add the new purchase to the purchases array in the PurchaseCollection
    expenseCollection.expenses.push(newExpense);

    // Save the updated PurchaseCollection to the database
    await expenseCollection.save();

    res.status(201).json({ status: 'SUCCESS', message: 'معلومات ثبت شو' });

    // Update stock based on the fuel type (you may need to implement this part)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
    });
  }
});

async function generateBillNumber() {
  try {
    // Find the document and update it by incrementing the billNumber
    const previousBillNumberDocument = await LastBillNumber.findOne();

    // If the document doesn't exist, create it with the default value
    if (!previousBillNumberDocument) {
      const newDocument = new LastBillNumber();
      await newDocument.save();
      console.log('Generated Bill Number:', newDocument.billNumber);
      return newDocument.billNumber;
    }

    const updatedBillNumberDocument = await LastBillNumber.findOneAndUpdate(
      {},
      { $inc: { billNumber: 1 } },
      { new: true }
    );

    const previousBillNumber = previousBillNumberDocument.billNumber;
    const newBillNumber = updatedBillNumberDocument.billNumber;

    console.log('Previous Bill Number:', previousBillNumber);
    console.log('New Bill Number:', newBillNumber);

    // Check if the newBillNumber is greater than the previousBillNumber by 1
    if (newBillNumber !== previousBillNumber + 1) {
      throw new Error(
        'Error: New Bill Number is not greater than the previous Bill Number by 1.'
      );
    }

    return newBillNumber;
  } catch (error) {
    console.error('Error generating bill number:', error);
    throw error;
  }
}
router.post('/addSale', auth, async (req, res) => {
  console.log('addSale', req.body.pricePerTon);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let payment;
    // Convert quantityInTons, quantityInLiters, and totalPrice to Numbers
    req.body.quantityInTons = parseFloat(req.body.quantityInTons);
    req.body.quantityInLiters = parseFloat(req.body.quantityInLiters);
    req.body.totalPrice = parseFloat(req.body.totalPrice);
    req.body.pricePerTon = parseFloat(req.body.pricePerTon);
    req.body.totalPaid = parseFloat(req.body.totalPaid);
    req.body.remaining = parseFloat(req.body.remaining);
    // Set the customer field by using the customerId in the request
    req.body.customer = req.body.customerId;

    // Create a new purchase instance using the Sale model
    const newSale = new Sale(req.body);

    // Set the billNumber before saving the new sale
    newSale.billNumber = await generateBillNumber();

    // Find the SaleCollection document with the given monthYear
    const saleCollection = await SaleCollection.findOne({
      monthYear: req.body.selectedCollection,
    });

    if (saleCollection) {
      // SaleCollection exists, push the newSale to its sales array
      saleCollection.sales.push(newSale);
      await saleCollection.save({ session });
    } else {
      // SaleCollection does not exist, create a new one
      const newSaleCollection = new SaleCollection({
        monthYear: req.body.selectedCollection,
        sales: [newSale],
      });
      await newSaleCollection.save({ session });
    }

    // Check if a customerPayment record with the given customerId already exists
    const existingCustomerPayment = await CustomerPayment.findOne({
      customer: req.body.customerId,
    });

    if (existingCustomerPayment) {
      // Update existing record by adding the sale information
      existingCustomerPayment.sales.push({ sale: newSale._id });

      // Update payment information
      existingCustomerPayment.payments.push({
        amount: req.body.remaining,
        paymentDate: req.body.saleDate,
        type: 'debit', // You can adjust this based on your logic
        reason: 'sale of fuel',
        billNumber: newSale.billNumber,
      });

      // Save the updated customerPayment record
      payment = await existingCustomerPayment.save({ session });
    } else {
      // Create a new customerPayment record
      const customerPayment = new CustomerPayment({
        customer: newSale.customer,
        sales: [{ sale: newSale._id }],
        payments: [
          {
            amount: req.body.remaining,
            paymentDate: newSale.saleDate,
            type: 'debit', // You can adjust this based on your logic
            reason: 'Sale of fuel',
            billNumber: newSale.billNumber,
          },
        ],
      });

      // Save the customerPayment record to the database
      payment = await customerPayment.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'SUCCESS',
      message: 'معلومات ثبت شو',
      savedSale: newSale,
      payment,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
    });
  }
});

router.get('/getAllSales', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Check if SaleCollection for the given month exists
    const saleCollection = await SaleCollection.findOne({ monthYear });

    if (!saleCollection) {
      return res.json({
        status: 'FAILED',
        message: 'خرڅلاو موجود ندی',
        data: [],
      });
    }

    // Retrieve all sales for the specified SaleCollection and populate the customer field
    const sales = await Sale.populate(saleCollection.sales, {
      path: 'customer',
    });

    if (sales.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'خرڅلاو موجود ندی',
        data: [],
      });
    }

    return res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی  ',
    });
  }
});

// router.get('/getAllSales', auth, async (req, res) => {
//   try {
//     // Use .populate() to include customer information (customer name)
//     let sales = await Sale.find().populate('customer', 'customerName');

//     if (sales.length === 0) {
//       return res.json({
//         status: 'FAILED',
//         message: ' خرید شتون نه لری',
//       });
//     } else {
//       return res.json(sales);
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: 'FAILED',
//       message: 'سرور مشکل',
//     });
//   }
// });

router.put('/updateSale', auth, async (req, res) => {
  const salesData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(salesData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    const { selectedCollection } = salesData; // Assuming you pass monthYear in the request body

    // Find SaleCollection by monthYear
    const saleCollection = await SaleCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!saleCollection) {
      return res
        .status(404)
        .json({ success: false, error: 'Sale Collection not found' });
    }

    // Find the sale within the sales array
    const saleIndex = saleCollection.sales.findIndex(
      (sale) => sale._id.toString() === salesData._id
    );

    if (saleIndex === -1) {
      return res.status(404).json({ success: false, error: 'Sale not found' });
    }

    // Fetch the existing sale document
    const existingSale = saleCollection.sales[saleIndex];

    // Update the sale record with the new data
    const updatedSale = { ...existingSale._doc, ...cleanedData }; // Merge existing and new data
    saleCollection.sales[saleIndex] = updatedSale;

    // Save the updated SaleCollection
    await saleCollection.save();

    // Find the associated CustomerPayment document
    const customerPayment = await CustomerPayment.findOne({
      customer: existingSale.customer,
    });

    // If customerPayment exists
    if (customerPayment) {
      // Check for the sale in the sales array
      const salePaymentIndex = customerPayment.sales.findIndex(
        (sale) => sale.sale.toString() === salesData._id
      );

      // If sale is found in the sales array
      if (salePaymentIndex !== -1) {
        // Update payment amount in CustomerPayment using remaining
        customerPayment.payments.forEach((payment) => {
          if (payment.billNumber === existingSale.billNumber) {
            // Use remaining as the updated payment amount
            payment.amount = salesData.remaining;
          }
        });

        // Save the updated CustomerPayment
        await customerPayment.save();
      }
    }

    res.status(200).json({ success: true, data: updatedSale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.delete('/deleteSale/:selectedCollection/:id', auth, async (req, res) => {
  const { selectedCollection, id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find SaleCollection by monthYear
    const saleCollection = await SaleCollection.findOne({
      monthYear: selectedCollection,
    }).session(session);

    console.log('saleCo', saleCollection);
    if (!saleCollection) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 'FAILED',
        message: '  collection not available',
      });
    }

    // Find and remove Sale from the sales array
    const saleIndex = saleCollection.sales.findIndex((sale) =>
      sale._id.equals(id)
    );

    if (saleIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 'FAILED', message: 'خرڅلاو موجود ندی' });
    }

    const removedSale = saleCollection.sales.splice(saleIndex, 1)[0];

    // Save the updated SaleCollection
    await saleCollection.save();

    // Delete Sale Reference in CustomerPayment
    await CustomerPayment.updateMany(
      { 'sales.sale': id },
      { $pull: { sales: { sale: id } } }
    ).session(session);

    // Find Sale BillNumber
    const billNumber = removedSale.billNumber;

    // Delete Sale Payment Reference in CustomerPayment
    await CustomerPayment.updateMany(
      { 'payments.billNumber': billNumber },
      { $pull: { payments: { billNumber: billNumber } } }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ status: 'success', message: 'ریکارد ډلیت شو', removedSale });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res
      .status(500)
      .json({ status: 'failed', message: 'Error processing request' });
  }
});

// router.post('/addExpense', auth, async (req, res) => {
//   try {
//     // Convert quantityInTons, quantityInLiters, and totalPrice to Numbers
//     req.body.amount = parseFloat(req.body.amount);

//     // Create a new purchase instance using the Purchase model
//     const newExpense = new Expense(req.body);

//     // Save the new purchase to the database
//     const r = await newExpense.save();

//     if (r) {
//       res.status(201).json({ status: 'SUCCESS', message: 'معلومات ثبت شو' });
//     }

//     // Update stock based on the fuel type
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: 'FAILED',
//       message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
//     });
//   }
// });
///////////////////////////////////////////////////////////////////////////////////////
router.get('/getAllExpenses', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Check if PurchaseCollection for the given month exists
    const expenseCollection = await ExpenseCollection.findOne({ monthYear });

    if (!expenseCollection) {
      return res.json({
        status: 'FAILED',
        message: 'مصرف شتون نه لری',
        data: [],
      });
    }

    // Retrieve all purchases for the specified PurchaseCollection
    const expenses = expenseCollection.expenses;

    if (expenses.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'مصرف شتون نه لری',
        data: [],
      });
    }

    return res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});
// router.get('/getAllExpenses', auth, async (req, res) => {
//   try {
//     let expenses = await Expense.find();
//     if (expenses.length === 0) {
//       return res.json({
//         status: 'FAILED',
//         message: ' لګښت شتون نه لری',
//       });
//     } else {
//       return res.json(expenses);
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: 'FAILED',
//       message: 'سرور مشکل',
//     });
//   }
// });
// router.put('/updateExpense', auth, async (req, res) => {
//   const salesData = req.body;

//   // Clean data by removing null or empty values
//   const cleanedData = {};
//   for (const [key, value] of Object.entries(salesData)) {
//     if (value !== null && value !== undefined && value !== '') {
//       cleanedData[key] = value;
//     }
//   }

//   try {
//     // If the password is provided in cleanedData, check its length

//     const updatedExpense = await Expense.findOneAndUpdate(
//       { _id: cleanedData._id },
//       { $set: cleanedData },
//       { new: true, useFindAndModify: false }
//     );

//     if (updatedExpense) {
//       res.json({ status: 'success', expense: updatedExpense });
//     } else {
//       res.status(404).json({ status: 'FAILED', message: 'لګښت پیدا نشو' });
//     }
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res
//       .status(500)
//       .json({ status: 'FAILED', message: 'Internal Server Error' });
//   }
// });

router.put('/updateExpense', auth, async (req, res) => {
  const expenseData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(expenseData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // Construct the update query dynamically based on the cleanedData

    // Create an empty object to store the dynamically constructed update data
    const updateData = {};

    // Iterate over the keys in cleanedData
    for (const key of Object.keys(cleanedData)) {
      // Construct the path for each field in the purchases array
      // For example, if key is 'driverName', the path will be 'purchases.$.driverName'
      updateData[`expenses.$.${key}`] = cleanedData[key];
    }

    // Use findOneAndUpdate to find the specific purchase and update only the specified fields
    const updateExpense = await ExpenseCollection.findOneAndUpdate(
      {
        monthYear: expenseData.selectedCollection,
        'expenses._id': expenseData._id,
      },
      { $set: updateData },
      { new: true, useFindAndModify: false }
    );

    if (updateExpense) {
      res.json({ status: 'success', message: ' ریکارد تغیر شو' });
    } else {
      res.status(404).json({ status: 'FAILED', message: 'ریکارد پیدا نشو' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.delete('/deleteExpense/:selectedCollection/:id', async (req, res) => {
  const { selectedCollection, id } = req.params;

  try {
    // Find the PurchaseCollection with the given monthYear
    const expenseCollection = await ExpenseCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!expenseCollection) {
      return res.json({
        status: 'FIELD',
        message: 'expense Collection not found',
      });
    }

    // Find the index of the purchase with the specified id in the purchases array
    const expenseIndex = expenseCollection.expenses.findIndex(
      (expense) => expense._id.toString() === id
    );

    if (expenseIndex === -1) {
      return res.json({ status: 'FIELD', message: 'expense not found' });
    }

    // Remove the purchase from the purchases array
    expenseCollection.expenses.splice(expenseIndex, 1);

    // Save the updated PurchaseCollection to the database
    await expenseCollection.save();

    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// router.delete('/deleteExpense/:id', async (req, res) => {
//   const userId = req.params.id;

//   try {
//     // Perform the deletion logic here
//     const deletedExpens = await Expense.findByIdAndDelete(userId);

//     if (deletedExpens) {
//       res.json({ status: 'success', message: 'ریکارد دلیت شو' });
//     } else {
//       res.status(404).json({ status: 'error', message: 'ریکارد شتون نه لری' });
//     }
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ status: 'error', message: 'Internal Server Error' });
//   }
// });

// router.post('/addSalary', async (req, res) => {
//   try {
//     const {
//       employeeId,
//       salaryDate,
//       salaryMonth,
//       salaryYear,
//       salaryAmount,
//       comment,
//     } = req.body;

//     // Check if the employeeId is valid
//     const employee = await Employee.findById(employeeId);
//     if (!employee) {
//       return res
//         .status(400)
//         .json({ status: 'FAILED', message: 'Invalid employeeId' });
//     }

//     // Check if a salary record already exists for the specified employee ID, year, and month
//     const existingSalary = await Salary.findOne({
//       employee: employeeId,
//       salaryYear,
//       salaryMonth,
//     });

//     if (existingSalary) {
//       return res.status(400).json({
//         status: 'FAILED',
//         message: 'د نومړی میاشتی معاش د مخه اجرا شوی',
//       });
//     }

//     // Generate the invoiceNumber with a hyphen and a sequence number
//     const latestSalary = await Salary.findOne(
//       {},
//       {},
//       { sort: { createdAt: -1 } }
//     );

//     // Extract the numeric portion, increment it, and add the "sal-" prefix
//     const lastInvoiceNumber = latestSalary
//       ? parseInt(latestSalary.invoiceNumber.replace('sal-', ''), 10)
//       : 0;

//     const invoiceNumber = `sal-${lastInvoiceNumber + 1}`;

//     // Create the new salary record
//     const newSalary = new Salary({
//       employee: employeeId,
//       salaryDate,
//       salaryMonth,
//       salaryYear,
//       salaryAmount,
//       comment,
//       invoiceNumber,
//     });

//     // Save the salary record to the database
//     await newSalary.save();

//     res.json({
//       status: 'SUCCESS',
//       message: 'Salary record added successfully',
//       data: {
//         salaryRecord: {
//           _id: newSalary._id,
//           employee: employeeId,
//           salaryDate,
//           salaryMonth,
//           salaryYear,
//           salaryAmount,
//           comment,
//           invoiceNumber,
//         },
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ status: 'FAILED', message: 'Internal Server Error' });
//   }
// });

router.post('/addSalary', auth, async (req, res) => {
  try {
    const {
      employeeId,
      salaryDate,
      salaryMonth,
      salaryYear,
      salaryAmount,
      selectedCollection,
      comment,
    } = req.body;

    // Check if the SalaryCollection for the given month exists, create one if not
    let salaryCollection = await SalaryCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!salaryCollection) {
      // If SalaryCollection doesn't exist, create a new one with a default status of 'open'
      salaryCollection = new SalaryCollection({
        monthYear: selectedCollection,
        status: 'open',
        salaries: [],
      });
    } else {
      // Check if the employee has an existing salary record for the specified monthYear
      const existingSalary = salaryCollection.salaries.find(
        (salary) =>
          salary.employee.toString() === employeeId &&
          salary.salaryMonth === salaryMonth &&
          salary.salaryYear === salaryYear
      );

      if (existingSalary) {
        return res.json({
          status: 'FAILED',
          message:
            'Salary record already exists for the specified employee, month, and year in the selected monthYear',
        });
      }
    }

    // Generate the invoiceNumber with a hyphen and a sequence number
    const invoiceNumber = await generateBillNumber();

    // Create a new Salary instance with the generated invoiceNumber
    const newSalary = new Salary({
      employee: employeeId,
      salaryDate,
      salaryMonth,
      salaryYear,
      salaryAmount,
      comment,
      invoiceNumber,
    });

    // Add the new salary to the salaries array in the SalaryCollection
    salaryCollection.salaries.push(newSalary);

    // Save the updated SalaryCollection to the database
    const savedSalaryCollection = await salaryCollection.save();

    // Get the newly added salary from the saved SalaryCollection
    const newSalaryRecord = savedSalaryCollection.salaries.find(
      (salary) =>
        salary.employee.toString() === employeeId &&
        salary.salaryMonth === salaryMonth &&
        salary.salaryYear === salaryYear
    );

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Salary record added successfully',
      newSalaryRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'FAILED',
      message: 'Internal Server Error',
    });
  }
});

router.get('/getSalaryRecord/:id', auth, async (req, res) => {
  try {
    const salaryId = req.params.id;

    // Use Mongoose population to get employee details along with salary
    const salary = await Salary.findById(salaryId)
      .populate({
        path: 'employee',
        model: 'Employee', // Assuming your Employee model is named 'Employee'
        select: 'name position NIC contactNumber salary',
      })
      .exec();

    if (!salary) {
      return res.status(404).json({ error: 'Salary not found' });
    }

    res.status(200).json(salary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.get('/getAllSalaries', auth, async (req, res) => {
//   try {
//     let expenses = await Salary.find();
//     if (expenses.length === 0) {
//       return res.json({
//         status: 'FAILED',
//         message: ' لګښت شتون نه لری',
//       });
//     } else {
//       return res.json(expenses);
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: 'FAILED',
//       message: 'سرور مشکل',
//     });
//   }
// });

router.get('/getAllSalaries', auth, async (req, res) => {
  try {
    const { monthYear } = req.query;

    // Check if SaleCollection for the given month exists
    const salaryCollection = await SalaryCollection.findOne({ monthYear });

    if (!salaryCollection) {
      return res.json({
        status: 'FAILED',
        message: 'معاش موجود ندی',
        data: [],
      });
    }

    // Retrieve all sales for the specified SaleCollection and populate the customer field
    const salary = await Salary.populate(salaryCollection.salaries, {
      path: 'employee',
    });

    if (salary.length === 0) {
      return res.json({
        status: 'FAILED',
        message: 'معاش موجود ندی',
        data: [],
      });
    }

    return res.json(salary);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی  ',
    });
  }
});

// router.get('/getAllSalariesFull', auth, async (req, res) => {
//   try {
//     let salaries = await Salary.find()
//       .populate({
//         path: 'employee',
//         model: 'Employee', // Assuming your Employee model is named 'Employee'
//         select: 'name position NIC contactNumber salary',
//       })
//       .exec();
//     if (salaries.length === 0) {
//       return res.json({
//         status: 'FAILED',
//         message: ' معاش شتون نه لری',
//       });
//     } else {
//       return res.json(salaries);
//     }
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       status: 'FAILED',
//       message: 'سرور مشکل',
//     });
//   }
// });

// router.put('/updateSalary', auth, async (req, res) => {
//   const salaryData = req.body;

//   // Clean data by removing null or empty values
//   const cleanedData = {};
//   for (const [key, value] of Object.entries(salaryData)) {
//     if (value !== null && value !== undefined && value !== '') {
//       cleanedData[key] = value;
//     }
//   }

//   try {
//     // Check if salary entry already exists for the specified employee, month, and year

//     // If the password is provided in cleanedData, check its length
//     const updatedSalary = await Salary.findOneAndUpdate(
//       { _id: cleanedData._id },
//       { $set: cleanedData },
//       { new: true, useFindAndModify: false }
//     );

//     if (updatedSalary) {
//       res.json({ status: 'success', salary: updatedSalary });
//     } else {
//       res.status(404).json({ status: 'FAILED', message: 'معاش پیدا نشو' });
//     }
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res
//       .status(500)
//       .json({ status: 'FAILED', message: 'Internal Server Error' });
//   }
// });

router.put('/updateSalary', auth, async (req, res) => {
  const salaryData = req.body;

  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries(salaryData)) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // Construct the update query dynamically based on the cleanedData

    // Create an empty object to store the dynamically constructed update data
    const updateData = {};

    // Iterate over the keys in cleanedData
    for (const key of Object.keys(cleanedData)) {
      // Construct the path for each field in the purchases array
      // For example, if key is 'driverName', the path will be 'purchases.$.driverName'
      updateData[`salaries.$.${key}`] = cleanedData[key];
    }

    // Use findOneAndUpdate to find the specific purchase and update only the specified fields
    const updateSalary = await SalaryCollection.findOneAndUpdate(
      {
        monthYear: salaryData.selectedCollection,
        'salaries._id': salaryData._id,
      },
      { $set: updateData },
      { new: true, useFindAndModify: false }
    );

    if (updateSalary) {
      res.json({ status: 'success', message: 'ریکارد تغیر شو' });
    } else {
      res.status(404).json({ status: 'FAILED', message: 'ریکارد پیدا نشو' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res
      .status(500)
      .json({ status: 'FAILED', message: 'Internal Server Error' });
  }
});

router.delete('/deleteSalary/:selectedCollection/:id', async (req, res) => {
  const { selectedCollection, id } = req.params;

  try {
    // Find the PurchaseCollection with the given monthYear
    const salaryCollection = await SalaryCollection.findOne({
      monthYear: selectedCollection,
    });

    if (!salaryCollection) {
      return res.json({
        status: 'FIELD',
        message: 'salary Collection not found',
      });
    }

    // Find the index of the purchase with the specified id in the purchases array
    const salaryIndex = salaryCollection.salaries.findIndex(
      (salary) => salary._id.toString() === id
    );

    if (salaryIndex === -1) {
      return res.json({ status: 'FIELD', message: 'salary not found' });
    }

    // Remove the purchase from the purchases array
    salaryCollection.salaries.splice(salaryIndex, 1);

    // Save the updated PurchaseCollection to the database
    await salaryCollection.save();

    res.json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});
// router.delete('/deleteSalary/:id', async (req, res) => {
//   const salaryId = req.params.id;

//   try {
//     // Perform the deletion logic here
//     const deletedSalary = await Salary.findByIdAndDelete(salaryId);

//     if (deletedSalary) {
//       res.json({ status: 'success', message: 'ریکارد دلیت شو' });
//     } else {
//       res.status(404).json({ status: 'error', message: 'ریکارد شتون نه لری' });
//     }
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ status: 'error', message: 'Internal Server Error' });
//   }
// });

// router.get('/stock', auth, async (req, res) => {
//   try {
//     const availableStock = await calculateStock();

//     res.json({ availableStock });
//   } catch (error) {
//     console.error('Error fetching stock:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// const calculateStock = async () => {
//   try {
//     const fuelTypes = ['petrol', 'diesel', 'gas'];

//     const stockByFuelType = [];

//     for (const fuelType of fuelTypes) {
//       // Get total quantity purchased for the current fuel type
//       const totalPurchased = await Purchase.aggregate([
//         {
//           $match: { fuelType },
//         },
//         {
//           $group: {
//             _id: null,
//             totalQuantityLiters: { $sum: '$quantityInLiters' },
//             totalQuantityTons: { $sum: '$quantityInTons' },
//           },
//         },
//       ]);

//       // Get total quantity sold for the current fuel type
//       const totalSold = await Sale.aggregate([
//         {
//           $match: { fuelType },
//         },
//         {
//           $group: {
//             _id: null,
//             totalQuantityLiters: { $sum: '$quantityInLiters' },
//             totalQuantityTons: { $sum: '$quantityInTons' },
//           },
//         },
//       ]);

//       // Calculate available stock for the current fuel type
//       const availableStock = {
//         fuelType,
//         quantityInLiters:
//           (totalPurchased[0]?.totalQuantityLiters || 0) -
//           (totalSold[0]?.totalQuantityLiters || 0),
//         quantityInTons:
//           (totalPurchased[0]?.totalQuantityTons || 0) -
//           (totalSold[0]?.totalQuantityTons || 0),
//       };

//       stockByFuelType.push(availableStock);
//     }

//     return stockByFuelType;
//   } catch (error) {
//     console.error('Error calculating stock:', error);
//     throw error;
//   }
// };

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

router.get('/getCustomerPaymentRecord/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;

    // Find the customer payments based on the customer ID
    const customerPayments = await CustomerPayment.find({
      customer: customerId,
    });

    // Check if the customer payments exist
    if (!customerPayments) {
      return res
        .status(404)
        .json({ status: 'FIELD', message: 'Customer payments not found' });
    }
    if (customerPayments.length === 0) {
      return res
        .status(404)
        .json({ status: 'FIELD', message: 'Customer payments not found' });
    }

    // Extract and filter payments for debit type
    const paymentInfo = customerPayments.map((payment) => ({
      customer: payment.customer,
      payments: payment.payments,
    }));

    res.json(paymentInfo);
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

router.post('/updateAccount', auth, async (req, res) => {
  try {
    let payment;
    // Convert quantityInTons, quantityInLiters, and totalPrice to Numbers

    // Set the billNumber before saving the new sale
    const billNumber = await generateBillNumber();

    // Save the new sale to the database

    // Check if a customerPayment record with the given customerId already exists
    const existingCustomerPayment = await CustomerPayment.findOne({
      customer: req.body.customer_id,
    });

    if (existingCustomerPayment) {
      // Update existing record by adding the sale information

      // Update payment information
      existingCustomerPayment.payments.push({
        amount: req.body.amount,
        paymentDate: req.body.paymentDate,
        type: req.body.type, // You can adjust this based on your logic
        reason: req.body.reason,
        billNumber: billNumber,
      });

      // Save the updated customerPayment record
      payment = await existingCustomerPayment.save();
    } else {
      // Create a new customerPayment record
      const customerPayment = new CustomerPayment({
        customer: req.body.customer_id,
        payments: [
          {
            amount: req.body.amount,
            paymentDate: req.body.paymentDate,
            type: req.body.type, // You can adjust this based on your logic
            reason: req.body.reason,
            billNumber: billNumber,
          },
        ],
      });

      // Save the customerPayment record to the database
      payment = await customerPayment.save();
    }

    // Commit the transaction

    res.json({
      status: 'SUCCESS',
      message: 'معلومات ثبت شو',

      payment,
    });
  } catch (error) {
    // Rollback the transaction in case of an error

    console.error(error);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور کی مشکل دی لطفا دوباره کوشش وکړی',
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
      const customerPayment = await CustomerPayment.findOne({
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
  const { _id, billNumber, customerId, amount, reason, type, date } = req.body;

  const paymentDate = date;
  // Clean data by removing null or empty values
  const cleanedData = {};
  for (const [key, value] of Object.entries({
    _id,
    amount,
    reason,
    customerId,
    type,
    billNumber,
    paymentDate,
  })) {
    if (value !== null && value !== undefined && value !== '') {
      cleanedData[key] = value;
    }
  }

  try {
    // Use await to execute the findOne query
    const existingCustomerPaymentRecord = await CustomerPayment.findOne({
      customer: customerId,
    });

    // Find the index of the payment record to update
    const paymentIndex = existingCustomerPaymentRecord.payments.findIndex(
      (payment) => payment._id.toString() === _id
    );

    // Check if the payment with the given ID was found
    if (paymentIndex !== -1) {
      // Update the payment record in the payments array
      existingCustomerPaymentRecord.payments[paymentIndex] = {
        ...existingCustomerPaymentRecord.payments[paymentIndex],
        ...cleanedData,
      };

      // Save the updated customer payment
      await existingCustomerPaymentRecord.save();

      return res.json({
        status: 'SUCCESS',
        message: 'ریکارد تغیر شو',
      });
    } else {
      return res.json({
        status: 'FAILED',
        message: 'معلومات پیدا نه شو',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
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

    // Create the new salary record
    const newCollection = new CollectionsDateManagement({
      collectionName: formattedDate,
    });

    // Save the salary record to the database
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
    let expenses = await CollectionsDateManagement.find();
    if (expenses.length === 0) {
      return res.json({
        status: 'FAILED',
        message: ' لګښت شتون نه لری',
      });
    } else {
      return res.json(expenses);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'FAILED',
      message: 'سرور مشکل',
    });
  }
});
module.exports = router;
