import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaDownload, FaSync, FaCheckCircle, FaTimesCircle, FaSearch, FaTrash, FaCheckSquare } from 'react-icons/fa';
import { showSuccess, showError, showWarning } from '../../lib/toast';

interface Application {
  id: string;
  name?: string;
  email?: string;
  phone_number: string;
  department: string;
  grade: number;
  age: number;
  gpa: string;
  has_startup_item: boolean;
  self_introduction: string;
  created_at: string;
  ip_address: string;
}

const PreliminaryApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStartupItem, setFilterStartupItem] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
    // Reset selections when filter changes
    setSelectedIds(new Set());
    setSelectAll(false);
  }, [searchTerm, filterDepartment, filterGrade, filterStartupItem, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('preliminary_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        // Don't use mock data - show real error to user
        setApplications([]);
        return;
      }
      
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        (app.name || '').includes(searchTerm) ||
        (app.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone_number.includes(searchTerm) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.self_introduction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filterDepartment) {
      filtered = filtered.filter(app =>
        app.department.toLowerCase().includes(filterDepartment.toLowerCase())
      );
    }

    // Grade filter
    if (filterGrade) {
      filtered = filtered.filter(app =>
        app.grade === parseInt(filterGrade)
      );
    }

    // Startup item filter
    if (filterStartupItem !== 'all') {
      filtered = filtered.filter(app =>
        app.has_startup_item === (filterStartupItem === 'yes')
      );
    }

    setFilteredApplications(filtered);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredApplications.map(app => app.id));
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      setSelectAll(false);
    } else {
      newSelected.add(id);
      if (newSelected.size === filteredApplications.length) {
        setSelectAll(true);
      }
    }
    setSelectedIds(newSelected);
  };

  // Delete selected applications
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      showWarning('삭제할 항목을 선택해주세요.');
      return;
    }

    const confirmed = window.confirm(
      `선택한 ${selectedIds.size}개의 신청 내역을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      const idsToDelete = Array.from(selectedIds);
      const { error } = await supabase
        .from('preliminary_applications')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('Delete error:', error);
        showError('삭제 중 오류가 발생했습니다.');
        return;
      }

      showSuccess(`${selectedIds.size}개 항목이 삭제되었습니다.`, 2000);
      setSelectedIds(new Set());
      setSelectAll(false);
      await fetchApplications();
    } catch (error) {
      console.error('Error deleting applications:', error);
      showError('삭제 중 오류가 발생했습니다.');
    }
  };

  // Download selected or all applications as CSV
  const exportToCSV = (selectedOnly: boolean = false) => {
    const dataToExport = selectedOnly && selectedIds.size > 0
      ? filteredApplications.filter(app => selectedIds.has(app.id))
      : filteredApplications;

    if (dataToExport.length === 0) {
      showWarning('다운로드할 데이터가 없습니다.');
      return;
    }

    const headers = ['신청일시', '이름', '이메일', '전화번호', '학과', '학년', '나이', '학점', '창업아이템', '자기소개'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(app => [
        format(new Date(app.created_at), 'yyyy-MM-dd HH:mm', { locale: ko }),
        app.name || '',
        app.email || '',
        app.phone_number,
        app.department,
        `${app.grade}학년`,
        app.age,
        app.gpa,
        app.has_startup_item ? '있음' : '없음',
        `"${app.self_introduction.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = selectedOnly
      ? `예비신청_선택${selectedIds.size}건_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
      : `예비신청_전체_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDepartments = () => {
    const departments = [...new Set(applications.map(app => app.department))];
    return departments.sort();
  };

  const getStats = () => {
    const total = filteredApplications.length;
    const withStartupItem = filteredApplications.filter(app => app.has_startup_item).length;
    const gradeDistribution = [1, 2, 3, 4].map(grade => ({
      grade,
      count: filteredApplications.filter(app => app.grade === grade).length
    }));

    return { total, withStartupItem, gradeDistribution };
  };

  const stats = getStats();

  return (
    <>
      <Head>
        <title>예비 신청 관리 - 관리자</title>
      </Head>

      <AdminLayout title="예비 신청 관리">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">총 신청자</p>
            <p className="text-2xl font-bold text-primary">{stats.total}명</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">창업 아이템 보유</p>
            <p className="text-2xl font-bold text-green-600">{stats.withStartupItem}명</p>
            <p className="text-xs text-gray-500">
              ({stats.total > 0 ? Math.round((stats.withStartupItem / stats.total) * 100) : 0}%)
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">학년 분포</p>
            <div className="flex justify-between mt-1">
              {stats.gradeDistribution.map(({ grade, count }) => (
                <div key={grade} className="text-center">
                  <p className="text-xs text-gray-500">{grade}학년</p>
                  <p className="font-semibold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="이름, 이메일, 전화번호, 학과"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FaSearch className="absolute left-2.5 top-3 text-gray-400" size={14} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학과</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">전체</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">전체</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
                <option value="4">4학년</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">창업 아이템</label>
              <select
                value={filterStartupItem}
                onChange={(e) => setFilterStartupItem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">전체</option>
                <option value="yes">있음</option>
                <option value="no">없음</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchApplications}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaSync size={14} />
                새로고침
              </button>
              <button
                onClick={() => exportToCSV(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaDownload size={14} />
                전체 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* Selection Action Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckSquare className="text-blue-600" size={20} />
              <span className="font-medium text-blue-900">
                {selectedIds.size}개 항목 선택됨
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportToCSV(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaDownload size={14} />
                선택 다운로드
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaTrash size={14} />
                선택 삭제
              </button>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                      disabled={filteredApplications.length === 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전화번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    학과
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    학년
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    나이
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    학점
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    창업아이템
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자기소개
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      신청 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className={`hover:bg-gray-50 ${selectedIds.has(app.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app.id)}
                          onChange={() => handleSelectOne(app.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(app.created_at), 'MM/dd HH:mm', { locale: ko })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.grade}학년
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.age}세
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          app.gpa === '미입력' ? 'bg-gray-100 text-gray-600' :
                          parseFloat(app.gpa) >= 4.0 ? 'bg-green-100 text-green-800' :
                          parseFloat(app.gpa) >= 3.5 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.gpa}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.has_startup_item ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaTimesCircle className="text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={app.self_introduction}>
                          {app.self_introduction || '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default PreliminaryApplicationsPage;
