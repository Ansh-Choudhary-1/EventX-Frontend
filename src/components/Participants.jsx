import { Users, Copy, Check, User, Upload } from 'lucide-react';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import participantService from '../backend/participant.js';
import submissionService from '../backend/submissions.js';

export default function TeamInvite() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [copied, setCopied] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { teamId,hackathonId } = useParams();
  console.log(teamId);
  
  
  // Mock data to use as fallback if API fails
  const mockTeamData = {
    teamID: teamId || 'TEAM123',
    teamName: 'Team Alpha',
    memberIds: ['member1', 'member2', 'member3'],
    createdAt: new Date().toISOString()
  };

  useEffect(() => {
    const fetchData = async() => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching team data for ID:", teamId);
        
        // Add timeout to prevent endless loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const dataPromise = participantService.getTeam(teamId);
        console.log(dataPromise);
        
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        if (!data) {
          throw new Error('No data received from server');
        }
        
        console.log("Team data received:", data);
        
        setTeamData({
          teamID: teamId,
          teamName: data.teamName,
          membersName: data.membersName || ['member1', 'member2', 'member3'],
          createdAt: data.createdAt
        });
      } catch (error) {
        console.error("Error fetching team data:", error.message);
        setError("Failed to load team data. Please try again later.");
        
        // Use mock data after multiple retries
        if (retryCount >= 2) {
          console.log("Using mock data after failed retries");
          setTeamData(mockTeamData);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId) {
      fetchData();
    } else {
      setError("No team ID provided");
      setTeamData(mockTeamData);
      setLoading(false);
    }
  }, [teamId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

const onSubmit = async (formData) => {
    if (!bannerFile) {
      alert("Please upload a banner file.");
      return;
    }
    
    if (bannerFile) {
      console.log("Here");
      
      const dataToSubmit = new FormData();

      console.log("Selected File:", bannerFile);
      dataToSubmit.append("Link",formData.gitLink)
      dataToSubmit.append("banner", bannerFile);

      for (let pair of dataToSubmit.entries()) {
        console.log(pair[0], pair[1]); // Should print: "banner", File object
      }
      
      submissionService.createSubmission(hackathonId,teamId,formData)
    }
  };

  const handleFileChange = (event) => {
    setBannerFile(event.target.files[0]);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamData?.teamID || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-20">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !teamData) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-20">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // At this point, we either have real team data or mock data as a fallback
  const displayData = teamData || mockTeamData;

  return (
    <div className="max-w-8xl mx-auto p-6 mt-20 flex justify-center flex-wrap">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden min-w-60 mr-10 ml-10">
        <div className="p-6">
          {/* Team Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {displayData.teamName}
              </h1>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{displayData.membersName.length} members</span>
                </div>
                {/* Member List */}
                <div className="space-y-1 mt-2">
                  {teamData.membersName?.map((item)=>(
                    <div className="flex items-center text-sm text-gray-600" key={item._id}>
                    <User className="h-4 w-4 mr-2" />
                    <span>{item.name}</span>
                  </div>
                  ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Team ID Section */}
          <div className="bg-gray-50 rounded-lg p-2 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Invitation Code
            </label>
            <div className="flex flex-wrap items-center justify-between bg-white rounded-md border border-gray-300 p-3 w-full">
              <code className="text-sm font-mono text-gray-900  overflow-x-auto max-w-full">
                {displayData.teamID}
              </code>
              <button
                onClick={handleCopyCode}
                className="ml-3 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
                <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Share this code with your teammates to invite them to join your team
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">How to join:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click on "Join Team" in the dashboard</li>
              <li>Enter the team invitation code</li>
              <li>Click "Join" to become a team member</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden min-w-60">
        <div className="p-6">
          {/* Submission Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Submission
              </h1>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-gray-500">



                <form onSubmit={handleSubmit(onSubmit)} name="banner" className="space-y-6">

               <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Resume Upload</label>
               <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                 <div className="space-y-1 text-center">
                   <Upload className="mx-auto h-12 w-12 text-gray-400" />
                   <label className="cursor-pointer text-blue-600 font-medium hover:text-blue-500">
                     {bannerFile?<span>{bannerFile.name}</span>:<span>Click here to upload</span>}
                     <input onChange={handleFileChange} type="file" className="sr-only"/>
                   </label>
                   <p className="text-xs text-gray-500">Max size of image cannot exceed 1MB!</p>
                 </div>
               </div>
              {errors.banner && <p className="mt-2 text-sm text-red-600">Banner is required</p>}
             </div>

             <input type="text" placeholder="GitHub Link" {...register('gitLink', { required: true })} className="block w-full border-gray-300 rounded-md p-2" required="true" />
             
             <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full">
              Submit
              </button>
             </form>
                </div>
                {/* Member List */}
              </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}