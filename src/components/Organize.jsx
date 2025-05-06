import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload , Sparkles} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createNewHackathon } from '../store/contractSlice';
import { useNavigate } from "react-router-dom";
import organizeService from '../backend/organize.js';
import { Particles } from "./magicui/particles";
import { toast } from 'react-hot-toast';

const OrganizeEventForm = () => {
  const navigate = useNavigate();
  const [bannerFile, setBannerFile] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();

  const handleFileChange = (event) => {
    setBannerFile(event.target.files[0]);
  };


  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Creating hackathon...");
    try {
           
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("finaleDate", data.endDate);
            formData.append("prizePool", data.prizePool);
            formData.append("maxTeamSize", data.maxTeamSize);
            formData.append("roundTotal", data.roundTotal);
            formData.append("votingOpen", data.isVoteActive);
            formData.append("banner", bannerFile);

            for (let pair of formData.entries()) {
              console.log(pair[0] + ": " + pair[1]); // ✅ Correct way to log FormData
          }
          
            

      const response = await organizeService.createHackathon(formData)
      if (response.success) {
        alert("Hackathon created successfully!");
        navigate("/")
    }
    } catch (err) {
          console.error("Error creating hackathon:", err);
          toast.error(`Error: ${err.message || "Something went wrong"}`);
        } finally {
          toast.dismiss(loadingToast);
        }
  };

  return (
    <div className= "min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="fixed w-full h-full inset-0 z-0">
      <Particles
           quantity={100}
           staticity={30}
           ease={50}
          size={2}
           refresh={false}
           color={"#0A0A08"}
           vx={0.5}
           vy={0.5}
         />
       </div>
      <div className=" relative max-w-4xl mx-auto bg-white/90 p-8 rounded-2xl  backdrop-blur-md border border-gray-200  shadow-md overflow-hidden">

      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-200 to-transparent rounded-bl-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-yellow-200 to-transparent rounded-tr-full -z-10"></div>

        <div className="flex justify-between mb-8">
          <button onClick={()=> navigate(-1)} className="flex items-center text-yellow-700 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className='flex items-center text-yellow-700 font-medium animate-pulse'>
            <Sparkles className='w-5 h-5 mr-2'/>
            Create Amazing Events
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">Organize an Event
          <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse">
          </span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} name="banner" className="space-y-6">
          <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
               <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-yellow-300 border-dashed rounded-md">
                 <div className="space-y-2 text-center">
                   <Upload className="mx-auto h-12 w-12 text-gray-400" />
                   <label className="cursor-pointer text-yellow-500 font-medium hover:text-yellow-700">

                     {bannerFile?(
                     <span className='text-green-600'>{bannerFile.name}</span>)
                     : (<span>Click here to upload</span>)}

                     <input onChange={handleFileChange} type="file" className="sr-only"/>
                   </label>

                   <p className="text-xs text-gray-500">Max size of image cannot exceed 1MB!</p>
                 </div>
               </div>
              {errors.banner && <p className="mt-2 text-sm text-red-600">Banner is required</p>}
             </div>

          <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
          <input type="text" placeholder="Event Name" {...register('name', { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all" />
          {errors.name && <p className="text-red-500 text-sm">Event name is required</p>}
          </div>

          <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea placeholder="Description" {...register('description', { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"></textarea>
          {errors.description && <p className="text-red-500 text-sm">Description is required</p>}
          </div>
          
          <div>
          <label htmlFor="prizePool" className="block text-sm font-medium text-gray-700 mb-1">Prize Pool</label>
          <input type="number" placeholder="Prize Pool" {...register('prizePool', { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all" />
          {errors.prizePool && <p className="text-red-500 text-sm">Prize pool is required</p>}
          </div>

         {/* Prize Percentages */}
         <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
         {["First", "Second", "Third"].map((prize, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{prize} Prize (%)</label>
              <input type="number" placeholder={`${prize} Prize (%)`} {...register(`${prize.toLowerCase()}PrizePercent`, { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all" />
            </div>
          ))}
          </div>

           <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
          <input type="number" placeholder="Max Team Size" {...register('maxTeamSize', { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all" />
          {errors.maxTeamSize && <p className="text-red-500 text-sm">Max team size is required</p>}
         
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {["Start", "End"].map((type, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{type} Date</label>
              <input type="date" {...register(`${type.toLowerCase()}Date`, { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all" />
              {errors[`${type.toLowerCase()}Date`] && <p className="text-red-500 text-sm">{type} date is required</p>}
            </div>
          ))}
          </div>

          <label htmlFor="roundTotal" className="block text-sm font-medium text-gray-700 mb-1">Total Rounds</label>
          <input type="number" placeholder="Total Rounds" {...register('roundTotal', { required: true })} className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all" />
          {errors.roundTotal && <p className="text-red-500 text-sm">Total rounds are required</p>}
          

          <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Is Vote Active?</label>
               <select
                 {...register("isVoteActive", { required: true })}
                 className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition-all"
               >
                 <option value="true">True</option>
                 <option value="false">False</option>
               </select>
               {errors.isVoteActive && (
                 <p className="mt-2 text-sm text-red-600">Vote status is required</p>
               )}
             </div>

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full">
            Create Event 
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrganizeEventForm;






































































