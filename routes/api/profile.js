const express = require('express');
const config = require('config');
const request = require('request');
const auth = require('../../middleware/auth');
const { check, validationResult, body } = require('express-validator');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');

router.get('/:id', async({params: {id}}, res) => {
  try {
    const profile = await Profile.findOne({
      user: id
    }).populate('user', ['name', 'avatar']);
    if(!profile) return res.status(400).json({msg: "Profile not found"});
    // return res.json(profile);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({msg: 'Server error'})
    
  }
});

router.post(
  '/',
    auth,
  async (req, res) => {


    const {
      
      location,
      
    } = req.body;

    //Creating Profile Objects
    const profileFields = {};

    profileFields.user = req.user.id;

    
    if (location) profileFields.location = location;
    

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        res.json(profile);
      }

      if (!profile) {
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Server Error.');
      }
    }
  }
);


// router.get('/', (req, res) => {
//   res.send('Profile Route.');
// });

// router.post(
//   '/me',
//   [
//     auth,
//     [
//       check('skills', 'Skill is required').not().isEmpty(),
//       check('status', 'Status is required').not().isEmpty(),
//     ],
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       company,
//       website,
//       location,
//       status,
//       skills,
//       bio,
//       githubusername,
//       youtube,
//       twitter,
//       facebook,
//       linkedin,
//       instagram,
//     } = req.body;

//     //Creating Profile Objects
//     const profileFields = {};

//     profileFields.user = req.user.id;

//     if (company) profileFields.company = company;
//     if (website) profileFields.website = website;
//     if (location) profileFields.location = location;
//     if (status) profileFields.status = status;
//     if (bio) profileFields.bio = bio;
//     if (githubusername) profileFields.githubusername = githubusername;
//     if (skills) {
//       profileFields.skills = skills.split(',').map(skill => skill.trim());
//     }

//     // Creating Social object
//     profileFields.social = {};

//     if (youtube) profileFields.social.youtube = youtube;
//     if (twitter) profileFields.social.twitter = twitter;
//     if (facebook) profileFields.social.facebook = facebook;
//     if (linkedin) profileFields.social.linkedin = linkedin;
//     if (instagram) profileFields.social.instagram = instagram;

//     try {
//       let profile = await Profile.findOne({ user: req.user.id });
//       if (profile) {
//         profile = await Profile.findOneAndUpdate(
//           { user: req.user.id },
//           { $set: profileFields },
//           { new: true }
//         );
//         res.json(profile);
//       }

//       if (!profile) {
//         profile = new Profile(profileFields);
//         await profile.save();
//         res.json(profile);
//       }
//     } catch (err) {
//       if (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error.');
//       }
//     }
//   }
// );

// // @router PUT api/profile/experience
// // @desc Adding experience to the profile
// // @access Private

// router.put(
//   '/experience',
//   [
//     auth,
//     [
//       check('title', 'Title is required').not().isEmpty(),
//       check('company', 'Company is required').not().isEmpty(),
//       check('from', 'From date is required').not().isEmpty(),
//     ],
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json({ msg: errors.array() });
//     }

//     const { title, company, location, from, to, current, description } =
//       req.body;

//     const newExp = {
//       title,
//       company,
//       location,
//       from,
//       to,
//       current,
//       description,
//     };

//     try {
//       const profile = await Profile.findOne({ user: req.user.id });
//       profile.experience.unshift(newExp);
//       await profile.save();
//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   }
// );

// // @route    GET api/profile
// // @desc     Get all profiles
// // @access   Public
// router.get('/', async (req, res) => {
//   try {
//     const profiles = await Profile.find().populate('user', ['name', 'avatar']);
//     res.json(profiles);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // @route    GET api/profile/user/:user_id
// // @desc     Get profile by user ID
// // @access   Public
// router.get(
//   '/user/:user_id',
//   async ({ params: { user_id } }, res) => {
//     try {
//       const profile = await Profile.findOne({
//         user: user_id
//       }).populate('user', ['name', 'avatar']);

//       if (!profile) return res.status(400).json({ msg: 'Profile not found' });

//       return res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       return res.status(500).json({ msg: 'Server error' });
//     }
//   }
// );


// // @route DELETE api/profile/experience/:exp_id
// // @desc Deleting the experience from profile
// // access Private

// router.delete('/experience/:exp_id', auth, async (req, res) => {
//   const profile = await Profile.findOne({ user: req.user.id });
//   try {
//     profile.experience = profile.experience.filter(
//       item => item.id !== req.params.exp_id
//     );
//     await profile.save();
//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error.');
//   }
// });

// // @route POST api/profile/education
// // @desc Adding education details to profile
// // @access Private

// router.post(
//   '/education',
//   [
//     auth,
//     [
//       check('school', 'School name is required').not().isEmpty(),
//       check('degree', 'Degree is required').not().isEmpty(),
//       check('fieldofstudy', 'Field of study is required').not().isEmpty(),
//       check('from', 'From date is required').not().isEmpty(),
//     ],
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(400).json({ errors: errors.array() });
//     }

//     const { school, degree, fieldofstudy, from, to, current, description } =
//       req.body;

//     const newEdu = {
//       school,
//       degree,
//       fieldofstudy,
//       from,
//       to,
//       current,
//       description,
//     };
//     try {
//       const profile = await Profile.findOne({ user: req.user.id });
//       profile.education.unshift(newEdu);
//       await profile.save();
//       res.json(profile);
//     } catch (err) {
//       if (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error.');
//       }
//     }
//   }
// );

// // @route DELETE api/profile/education/:edu_id
// // @desc Delete eduation details from id.
// // @access Private

// router.delete('/education/:edu_id', auth, async (req, res) => {
//   const profile = await Profile.findOne({ user: req.user.id });

//   try {
//     profile.education = profile.education.filter(
//       item => item.id !== req.params.edu_id
//     );
//     await profile.save();
//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error.');
//   }
// });

// // @route GET api/profile/github/:username
// // @desc Get github users data by using username
// // @access Public

// router.get('/github/:username', (req, res) => {
//   try {
//     const options = {
//       uri: `https://api.github.com/users/${
//         req.params.username
//       }/repos?per_page=5&sort=created:asc&client_id=${config.get(
//         'githubClientId'
//       )}&client_secret=${config.get('githubSecret')}`,
//       method: 'GET',
//       headers: { 'user-agent': 'node.js' },
//     };
//     request(options, (error, response, body) => {
//       if (error) console.error(error);
//       if (response.statusCode !== 200) {
//         return res.status(400).json({ msg: 'Github username not found.' });
//       }
//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

module.exports = router;
