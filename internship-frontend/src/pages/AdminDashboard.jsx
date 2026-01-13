import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { 
  Briefcase, LogOut, Users, Building2, FileText, TrendingUp,
  Loader2, Calendar, CheckCircle, Clock, Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardRes, reportsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getReports(),
      ]);
      setDashboard(dashboardRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">InternHub</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-10 w-10 opacity-80" />
                <Activity className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-blue-100 text-sm mb-1">Total Students</p>
              <p className="text-4xl font-bold">{dashboard?.stats.totalStudents}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="h-10 w-10 opacity-80" />
                <Activity className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-purple-100 text-sm mb-1">Total Companies</p>
              <p className="text-4xl font-bold">{dashboard?.stats.totalCompanies}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Briefcase className="h-10 w-10 opacity-80" />
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-green-100 text-sm mb-1">Active Internships</p>
              <p className="text-4xl font-bold">{dashboard?.stats.activeInternships}</p>
              <p className="text-xs text-green-100 mt-1">of {dashboard?.stats.totalInternships} total</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-10 w-10 opacity-80" />
                <Clock className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-orange-100 text-sm mb-1">Total Applications</p>
              <p className="text-4xl font-bold">{dashboard?.stats.totalApplications}</p>
              <p className="text-xs text-orange-100 mt-1">{dashboard?.stats.pendingApplications} pending</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Internships */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Internships</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboard?.recentInternships.map((internship) => (
                  <div key={internship.internshipID} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{internship.title}</p>
                      <p className="text-xs text-gray-600">{internship.companyName}</p>
                      <p className="text-xs text-gray-500 mt-1">{internship.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      internship.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {internship.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboard?.recentApplications.map((app) => (
                  <div key={app.applicationID} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{app.studentName}</p>
                      <p className="text-xs text-gray-600 truncate">{app.internshipTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{app.companyName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        {reports && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Application Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Applications by Status</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {reports.applicationsByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {item.status === 'Pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                        {item.status === 'Accepted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {item.status === 'Rejected' && <Clock className="h-5 w-5 text-red-500" />}
                        <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Companies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Top Companies</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {reports.topCompanies.slice(0, 5).map((company, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">{company.companyName}</span>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-900">{company.internshipCount}</p>
                        <p className="text-xs text-gray-500">{company.activeInternships} active</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}