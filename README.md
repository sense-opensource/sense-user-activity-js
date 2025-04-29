<h1 align="center">Sense User Activity JS</h1>

<p align="center" width="100%">
    <a href="https://github.com/sense-opensource/sense-user-activity-js/blob/main/LICENSE"> 
        <img width="9%" src="https://custom-icon-badges.demolab.com/github/license/denvercoder1/custom-icon-badges?logo=law"> 
    </a>
    <img width="12.6%" src="https://badge-generator.vercel.app/api?icon=Github&label=Last%20Commit&status=May&color=6941C6"/> 
    <a href="https://discord.gg/hzNHTpwt">
        <img width="10%" src="https://badge-generator.vercel.app/api?icon=Discord&label=Discord&status=Live&color=6941C6"> 
    </a>
</p>

<h2 align="center">Welcome to Sense’s open source repository</h2>

<p align="center" width="100%">  
<img width="4.5%" src="https://custom-icon-badges.demolab.com/badge/Fork-orange.svg?logo=fork"> <img width="4.5%" src="https://custom-icon-badges.demolab.com/badge/Star-yellow.svg?logo=star"> <img width="6.5%" src="https://custom-icon-badges.demolab.com/badge/Commit-green.svg?logo=git-commit&logoColor=fff"> 
</p>

<p style="text-align:center;"> 
  
<p align="center"> Sense is a client side library that enables you to identify users by pinpointing their hardware and software characteristics. This is done by computing a token that stays consistent in spite of any manipulation.</p>                           
<p align="center"> This tracking method works even in the browser's incognito mode and is not cleared by flushing the cache, closing the browser or restarting the operating system, using a VPN or installing AdBlockers. Sense is available as SenseOS for every open source requirement and is different from Sense PRO, our extremely accurate and detailed product.</p>


<p align="center"> Sense’s real time demo : https://pro.getsense.co/

**Try visiting the same page in an incognito mode or switch on the VPN and notice how the visitor identifier remains the same in spite of all these changes!** 

<h3 align="center">Getting started with Sense </h3>

#### Bash
```bash
    # Run the playground locally
    npm run playground

    # Build the project and generate the dist folder
    npm run build

```

#### JS Integration
```js
    // Include the Sense library 
    <script src="./sense.js"></script>

    // 🔧 Initialise the Sense library
    Sense.initSenseBehaviour();

    // / 📍 This code monitors input fields that include the data-behaviour attribute.
    // Example: <input type="text" data-behaviour="name" />

    // 🧠 Get user behaviour data
    const behaviour = Sense.getBehaviour();

    // OR use destructuring to access specific metrics  -->
    const { keyStrokeData, mouseMovements, scrollMetrics } = Sense.getBehaviour();

``` 
</pre>

<h3 align="center">Run this code here : (sandbox environment to check and verify the code)</h3>

<h4 align="center">Plug and play, in just 3 steps</h3>  

1️⃣ Visit the Git hub repository for the desired function : Validate your desired repository  
2️⃣ Download the code as a ZIP file : Host/clone the code in your local system or website  
3️⃣ Run the installer : Start testing the accuracy of your desired metrics 

#### With Sense, you can  

✅ Predict user intent : Identify the good from the bad visitors with precision  
✅ Create user identities : Tokenise events with a particular user and device  
✅ Custom risk signals : Developer specific scripts that perform unique functions  
✅ Protect against Identity spoofing : Prevent users from impersonation  
✅ Stop device or browser manipulation : Detect user behaviour anomalies 

### Resources 

#### MIT license : 

Sense OS is available under the <a href="https://github.com/sense-opensource/sense-user-activity-js/blob/main/LICENSE"> MIT license </a>

#### Contributors code of conduct : 

Thank you for your interest in contributing to this project! We welcome all contributions and are excited to have you join our community. Please read these <a href="https://github.com/sense-opensource/sense-user-activity-js/blob/main/code_of_conduct.md"> code of conduct </a> to ensure a smooth collaboration.

#### Where you can get support :     
![Gmail](https://img.shields.io/badge/Gmail-D14836?logo=gmail&logoColor=white)       product@getsense.co 

Public Support:

For questions, bug reports, or feature requests, please use the Issues and Discussions sections on our repository. This helps the entire community benefit from shared knowledge and solutions.

Community Chat:

Join our Discord server (link) to connect with other developers, ask questions in real-time, and share your feedback on Sense.

Interested in contributing to Sense?

Please review our <a href="https://github.com/sense-opensource/sense-user-activity-js/blob/main/CONTRIBUTING.md"> Contribution Guidelines </a> to learn how to get started, submit pull requests, or run the project locally. We encourage you to read these guidelines carefully before making any contributions. Your input helps us make Sense better for everyone!