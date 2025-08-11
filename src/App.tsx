import React, { useState, useEffect } from 'react';
import { Phone, Shield, User, Search, Upload, Check, ArrowRight, ArrowLeft, FileText, Clock, CheckCircle } from 'lucide-react';
import apiService from './services/api';

type Screen = 'verification' | 'registration' | 'status';

interface CandidateData {
  name: string;
  dob: string;
  aadhar: string;
  mobile: string;
  address: string;
  program: string;
  category: string;
  center: string;
  trainer: string;
  duration: string;
  candidateId?: string;
  status?: 'Enrolled' | 'Completed';
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('verification');
  const [candidateData, setCandidateData] = useState<CandidateData>({
    name: '',
    dob: '',
    aadhar: '',
    mobile: '',
    address: '',
    program: '',
    category: '',
    center: '',
    trainer: '',
    duration: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isNewCandidate, setIsNewCandidate] = useState<boolean | null>(null);
  const [searchResults, setSearchResults] = useState<CandidateData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Category 1 - Basic Skills', 'Category 2 - Intermediate Skills', 'Category 3 - Advanced Skills', 'Category 4 - Specialized Skills'];
  const centers = ['Center A - Delhi', 'Center B - Mumbai', 'Center C - Bangalore', 'Center D - Chennai'];
  const trainers = ['Trainer 1 - John Doe', 'Trainer 2 - Jane Smith', 'Trainer 3 - Mike Johnson'];

  const sendOtp = async () => {
    if (candidateData.mobile.length === 10) {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiService.sendOTP(candidateData.mobile);
        if (result.success) {
          setOtpSent(true);
          alert('OTP sent to your mobile number');
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to send OTP. Please try again.');
        console.error('Send OTP error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const verifyOtp = async () => {
    if (otp.length === 4) {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiService.verifyOTP(candidateData.mobile, otp);
        if (result.success) {
          setOtpVerified(true);
          alert('OTP verified successfully!');
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to verify OTP. Please try again.');
        console.error('Verify OTP error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLoading(true);
      
      // Simulate Aadhar data extraction from file (In real implementation, use OCR service)
      setTimeout(() => {
        setCandidateData(prev => ({
          ...prev,
          name: 'Rajesh Kumar',
          dob: '1992-03-15',
          aadhar: '2345-6789-0123'
        }));
        setLoading(false);
        alert('Aadhar data extracted successfully!');
      }, 1000);
    }
  };

  const handleAadharScan = () => {
    // Simulate Aadhar scanning
    setCandidateData(prev => ({
      ...prev,
      name: 'Priya Sharma',
      dob: '1985-08-20',
      aadhar: '9876-5432-1098'
    }));
    alert('Aadhar scanned successfully!');
  };

  const checkRecord = async () => {
    if (!candidateData.aadhar || !candidateData.mobile) {
      setError('Please complete mobile verification and Aadhar scanning first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.checkRecord(candidateData.aadhar, candidateData.mobile);
      
      if (result.exists) {
        setIsNewCandidate(false);
        alert(`Candidate already exists! ID: ${result.candidate.candidateId}`);
      } else {
        setIsNewCandidate(true);
        alert('New candidate detected. Proceeding to registration.');
        setCurrentScreen('registration');
      }
    } catch (error) {
      setError('Failed to check record. Please try again.');
      console.error('Check record error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCandidate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const registrationData = {
        name: candidateData.name,
        dob: candidateData.dob,
        aadharNumber: candidateData.aadhar,
        mobile: candidateData.mobile,
        address: candidateData.address,
        program: candidateData.category,
        category: candidateData.category,
        center: candidateData.center,
        trainer: candidateData.trainer,
        duration: candidateData.duration
      };
      
      const result = await apiService.registerCandidate(registrationData);
      
      if (result.success) {
        setCandidateData(prev => ({
          ...prev,
          candidateId: result.candidate.candidateId,
          status: result.candidate.status
        }));
        alert(`Candidate registered successfully! ID: ${result.candidate.candidateId}`);
        setCurrentScreen('status');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to register candidate. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCandidate = async (searchBy: 'aadhar' | 'mobile', value: string) => {
    if (value.length === 0) return;
    
    setLoading(true);
    setError(null);
    setSearchResults(null);
    
    try {
      const searchParams = searchBy === 'aadhar' ? { aadhar: value } : { mobile: value };
      const result = await apiService.searchCandidate(searchParams);
      
      if (result.success) {
        const candidate = result.candidate;
        setSearchResults({
          name: candidate.name,
          dob: candidate.dob,
          aadhar: candidate.aadharNumber,
          mobile: candidate.mobile,
          address: candidate.address,
          program: candidate.program,
          category: candidate.category,
          center: candidate.center,
          trainer: candidate.trainer,
          duration: candidate.duration,
          candidateId: candidate.candidateId,
          status: candidate.status
        });
      } else {
        setError('Candidate not found');
      }
    } catch (error) {
      setError('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const ScreenHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
      <div className="flex items-center gap-3">
        {icon}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </div>
  );

  const NavigationButtons = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-center gap-2 max-w-md mx-auto">
        <button
          onClick={() => setCurrentScreen('verification')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm ${
            currentScreen === 'verification' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4 mx-auto mb-1" />
          Verify
        </button>
        <button
          onClick={() => setCurrentScreen('registration')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm ${
            currentScreen === 'registration' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4 mx-auto mb-1" />
          Register
        </button>
        <button
          onClick={() => setCurrentScreen('status')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm ${
            currentScreen === 'status' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Search className="w-4 h-4 mx-auto mb-1" />
          Status
        </button>
      </div>
    </div>
  );

  const VerificationScreen = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <ScreenHeader title="DB Skills Portal - Candidate Verification" icon={<Shield className="w-6 h-6" />} />
      
      <div className="p-6 space-y-6">
        {/* Mobile Number & OTP Section */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={candidateData.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setCandidateData(prev => ({ ...prev, mobile: value }));
                }}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={candidateData.mobile.length !== 10 || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[120px] h-fit self-end flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>

          {otpSent && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setOtp(value);
                  }}
                  placeholder="Enter 4-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center"
                />
              </div>
              <button
                onClick={verifyOtp}
                disabled={otp.length !== 4 || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[100px] h-fit self-end flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          )}

          {otpVerified && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Mobile number verified successfully!</span>
            </div>
          )}
        </div>

        {/* Aadhar Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload/Scan Aadhar
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="file"
                id="aadhar-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="aadhar-upload"
                className="flex flex-col items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
              >
                <Upload className="w-5 h-5 mb-2" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
            </div>
            <button
              onClick={handleAadharScan}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex flex-col items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
              ) : (
                <FileText className="w-5 h-5 mb-2" />
              )}
              Scan Aadhar
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Auto-filled data will appear below after scanning
          </div>
        </div>

        {/* Auto-filled Data */}
        {candidateData.name && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-green-800">Auto-filled from Aadhar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={candidateData.name}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
                <input
                  type="date"
                  value={candidateData.dob}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar No.</label>
                <input
                  type="text"
                  value={candidateData.aadhar}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Check Record Button */}
        <button
          onClick={checkRecord}
          disabled={!otpVerified || !candidateData.name}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Check Record
        </button>

        {/* Results */}
        {isNewCandidate !== null && (
          <div className={`p-4 rounded-lg border-2 ${
            isNewCandidate 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              {isNewCandidate ? (
                <>
                  <User className="w-5 h-5" />
                  New Candidate - Proceed to Registration
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Already Trained Candidate
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const RegistrationScreen = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <ScreenHeader title="DB Skills Portal - New Candidate Registration" icon={<User className="w-6 h-6" />} />
      
      <div className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-800">Personal Information (Auto-filled)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={candidateData.name}
                readOnly
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={candidateData.dob}
                readOnly
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={candidateData.address}
              onChange={(e) => setCandidateData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter complete address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program Category</label>
            <select
              value={candidateData.category}
              onChange={(e) => setCandidateData(prev => ({ 
                ...prev, 
                category: e.target.value,
                duration: e.target.value.includes('Category 1') ? '2 months' : 
                         e.target.value.includes('Category 2') ? '3 months' :
                         e.target.value.includes('Category 3') ? '4 months' : '6 months'
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Center</label>
            <select
              value={candidateData.center}
              onChange={(e) => setCandidateData(prev => ({ ...prev, center: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select Center</option>
              {centers.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Trainer</label>
            <select
              value={candidateData.trainer}
              onChange={(e) => setCandidateData(prev => ({ ...prev, trainer: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select Trainer</option>
              {trainers.map(trainer => (
                <option key={trainer} value={trainer}>{trainer}</option>
              ))}
            </select>
          </div>

          {candidateData.duration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program Duration</label>
              <input
                type="text"
                value={candidateData.duration}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
          )}
        </div>

        <button
          onClick={saveCandidate}
          disabled={!candidateData.address || !candidateData.category || !candidateData.center || !candidateData.trainer}
          className="w-full py-4 bg-green-600 text-white rounded-lg font-medium text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Save & Issue Candidate ID
        </button>
      </div>
    </div>
  );

  const StatusScreen = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <ScreenHeader title="DB Skills Portal - Candidate Status" icon={<Search className="w-6 h-6" />} />
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Aadhar No.</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Aadhar number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                onBlur={(e) => e.target.value && searchCandidate('aadhar', e.target.value)}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter Aadhar number"]') as HTMLInputElement;
                  if (input?.value) {
                    const formattedAadhar = input.value.replace(/\D/g, '').replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
                    searchCandidate('aadhar', formattedAadhar);
                  }
                }}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 min-w-[100px] flex items-center justify-center disabled:bg-gray-300"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Mobile No.</label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Enter mobile number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                onBlur={(e) => e.target.value && searchCandidate('mobile', e.target.value)}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter mobile number"]') as HTMLInputElement;
                  if (input?.value) searchCandidate('mobile', input.value);
                }}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 min-w-[100px] flex items-center justify-center disabled:bg-gray-300"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {searchResults && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-blue-600">Searching...</span>
              </div>
            )}
            
            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <User className="w-6 h-6" />
              Candidate Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-600">Name:</span>
                  <span className="text-lg font-semibold text-gray-800">{searchResults.name}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-600">Candidate ID:</span>
                  <span className="text-lg font-semibold text-blue-600">{searchResults.candidateId}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-600">Program:</span>
                  <span className="text-lg font-semibold text-gray-800">{searchResults.category}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="block text-sm font-medium text-gray-600">Center:</span>
                  <span className="text-lg font-semibold text-gray-800">{searchResults.center}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-600">Trainer:</span>
                  <span className="text-lg font-semibold text-gray-800">{searchResults.trainer}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-600">Status:</span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    searchResults.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {searchResults.status === 'Completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    {searchResults.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">DB Skills Training Portal</h1>
          <p className="text-gray-600">Mobile Staff Application for Candidate Management</p>
        </div>

        {/* Main Content */}
        {currentScreen === 'verification' && <VerificationScreen />}
        {currentScreen === 'registration' && <RegistrationScreen />}
        {currentScreen === 'status' && <StatusScreen />}

        {/* Navigation */}
        <NavigationButtons />
      </div>
    </div>
  );
}

export default App;