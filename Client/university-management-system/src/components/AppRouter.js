import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './SignInUp/SignIn';
import SignUp from './SignInUp/SignUp';
import AddDepartment from './Form/AddDepartment';
import AddCourse from './Form/AddCourse';
import AddInstructor from './Form/AddInstructor';
import AddGrade from './Form/AddGrade';
import AddStudent from './Form/AddStudent';
import AllFaculties from './AllFaculties';
import AddFacultyForm from './Form/AddFaculty';
import AddMajor from './Form/AddMajor';
import AllDepartments from './AllDepartments';
import AllMajors from './AllMajors';
import MajorDetails from './MajorDetails';
import AllInstructors from './AllInstructors';
import AllCourses from './AllCourses'
import AllStudents from './AllStudents';
import Transcript from './Transcript';



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/faculties" element={<AllFaculties />} />
        <Route path="/addStudent" element={<AddStudent />} />        
        <Route path="/addFaculty" element={<AddFacultyForm />} /> 
        <Route path="/faculties/:adminId" element={<AllFaculties />} />
        <Route path="/faculty/:facultyId" element={<AllFaculties />} /> 
        <Route path="/addDepartment" element={<AddDepartment />} />
        <Route path="/departments" element={<AllDepartments />} />
        <Route path="/departments/faculty/:facultyId" element={<AllDepartments />} />
        <Route path="/majors" element={<AllMajors />} />
        <Route path="/addmajor" element={<AddMajor />} />
        <Route path="/majorDetails/:majorId" element={<MajorDetails />} />
        <Route path="/addCourse" element={<AddCourse />} />
        <Route path="/addInstructor" element={<AddInstructor />} />
        <Route path="/addStudent" element={<AddStudent />} />
        <Route path="/instructors/:majorId" element={<AllInstructors />} />
        <Route path="/courses/:majorId" element={<AllCourses />} />
        <Route path='/allinstructors' element={<AllInstructors />} />
        <Route path='/allCourses' element={<AllCourses />} />
        <Route path='/allStudents' element={<AllStudents/>}/>
        <Route path='/addGrade'element={<AddGrade/>} />
        <Route path='/showTranscript' element={<Transcript/>} />
        <Route path="/majordetails" element={<MajorDetails />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
