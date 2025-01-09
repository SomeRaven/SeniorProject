# Project Proposal

### Problem Description 
STEM Center problem with checking in and checking out students.
</br>
STEM Center problem with collecting data due to reasons: 
- Staff not taking accurate roll (not taking roll every day, missing students due to students coming in late or roll being taken later when it wasn't taken when class happened, etc.)
- Pulling data from old ways of collecting data and or keeping data (using Excel and Word docs).

STEM Center having an issue when needing to access student information (parent phone number, parent email, what class the student is in).
</br>
STEM Center not keeping valuable information and or data to help with getting grants and or funding. 
</br>
STEM Center not being able to manage student information with relative ease (inputting student data into a spreadsheet every semester).
</br>
STEM Center has to input students that have been taking classes from them for multiple semesters every semester. 
</br>
When the STEM Center had a check-in/check-out system in the past, there would be a line that would form due to parents having to check in their child/children every class period, creating annoyance with parents and lost time in class. 
</br>

### Proposed Solution 
Create a web-based application that manages student information. This application will also be able to export data for grant writing purposes. (Director wants to pull gender of students going back 5 years. System will give a CSV of all students that attended classes going back five years without repeating students.) Parents will be able to register their child with an account that will be linked to them for every class they take. They will input their child's Name, Age, Grade, Birth date, any health concerns and or allergies, and preferred pronouns as well as the parent's Name, Phone Number, and Email. They will be able to add multiple parent or adult contact information. They will then be issued a card like one would get from the library with the child's name in big letters, any medical information, and a barcode or QR code that is specific to that child. This is what the parent will use to check their child in or out every class period and it will also serve as the child's name tag. Parents or older children will just scan their card at the front desk and head to their class. Done. 

This card will also be able to be scanned by staff on their phones to pull up all of the necessary information such as the parent's phone number or email, what class/classes that child is taking at the moment, etc. This will reduce time taken to find information from an Excel sheet on a computer or from a printed-out version of that sheet. 

### Technical Overview
I will be programming with the framework Express for the server side and I need to research how to create an API that can be used for the web app and the iOS app. I will be learning a new framework for the frontend of the web app. I want to use React Native which is different than what we used in iOS App Development for the iOS app that will be used for the second part of the solution. Testing of the web app will be done with a laptop the STEM Center is providing which is a MacBook Pro (need to look at the year and if it is Intel or not). I will be using my personal iPhone for the testing of the iOS app. I am currently taking SE 4200 so I have an introduction to Express but not enough for what I want for this project. 

### Milestone List
**Week One**:
 Finish project proposal and start to make presentation
</br></br>**Week Two**:
 Start learning how to create an API that can be used between both iOS and web apps
</br></br>**Week Three**:
 Finish creating API and start creating the server side of the web app and iOS app
</br></br>**Week Four**:
*(Progress Checkpoint 1)* Clean up server side and start researching front end frameworks
</br></br>**Week Five**:
 Learn how to create account login and have an admin login 
</br></br>**Week Six**:
*(Progress Checkpoint 2)* Create minimal interface to test login and admin login before moving on and after login and admin is solid start working on user dashboard components (Add child (needs to have a QR code gen with it), edit information, etc.) create barcode / QR code scanner script to start sending roll data to server and test that
</br></br>**Week Seven**:
 Continue working on user dashboard and start working on admin dashboard (pull data, see all students, order by class or grade, add students into class etc.) start to test
</br></br>**Week Eight**:
*(Progress Checkpoint 3)* Week to catch up and clean up web app and test 
</br></br>**Week Nine**:
 Week to catch up and clean up web app and test 
</br></br>**Week Ten**:
 Start learning how to use React Native to develop the iOS app
</br></br>**Week Eleven**:
*(Progress Checkpoint 4)* I fear this will be quite the learning curve for me so continue to learn React Native. 
</br></br>**Week Twelve**:
 Start to implement features in app such as list of students, maybe having the ability to sort the students into classes and or grades
</br></br>**Week Thirteen**:
*(Progress Checkpoint 5)* Finish up displaying data and start to research how to do QR code scanning and pulling up students linked to QR code.
</br></br>**Week Fourteen**:
 I fear this will also be quite the learning curve so another week to learn how to get QR code scanning to work. Start to create project completion presentation
</br></br>**Week Fifteen**:
*(Project Completion Presentation)* Week to clean up everything last minute fixes and changes. Start Project Defense
</br></br>**Week Sixteen**:
*(Project Defense)* Computing showcase, and Project defense. 
</br></br>**Week Seventeen**:
*(Portfolio)* Final updates to portfolio done. 
</br></br>**Throughout project**:
 Updating LinkedIn and GitHub to show something other than high school Kyleigh's web internship. 

### Validation Plan
As stated in the Technical Overview and the Milestone List, I will be testing throughout with the STEM Center to get any feedback and issues that might come up. We will probably only test it out with a few parents and the admin's children before we roll it out to all of the students' parents to use. </br> After I get a working component I am hoping to set it up at the center for my director and bosses to start trying to use as I won't be the only one using it. Once feedback is received I will either note it for future development or fix it asap. 
</br> For the iOS development testing, I will test making multiple cards with different codes on them and testing them with my personal phone and then having my staff with iOS phones test while they are teaching that semester.
