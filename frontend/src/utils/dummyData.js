// Dummy data for development and testing

export const dummyWorkers = [
  {
    _id: 'worker1',
    userId: {
      _id: 'user1',
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@example.com',
      phone: '01234567890',
      city: 'القاهرة',
      area: 'المعادي',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'سباكة',
    hourPrice: 150,
    verificationStatus: 'verified',
    rankScore: 95,
    appliedJobsCount: 5,
    completedJobsCount: 12,
    createdAt: new Date('2024-01-15'),
    images: [
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=300&q=80',
    ],
    rating: 4.8,
  },
  {
    _id: 'worker2',
    userId: {
      _id: 'user2',
      firstName: 'محمد',
      lastName: 'علي',
      email: 'mohamed@example.com',
      phone: '01234567891',
      city: 'الجيزة',
      area: 'الدقي',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'كهرباء',
    hourPrice: 200,
    verificationStatus: 'verified',
    rankScore: 88,
    appliedJobsCount: 3,
    completedJobsCount: 8,
    createdAt: new Date('2024-02-10'),
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=300&q=80',
    ],
    rating: 4.6,
  },
  {
    _id: 'worker3',
    userId: {
      _id: 'user3',
      firstName: 'خالد',
      lastName: 'حسن',
      email: 'khaled@example.com',
      phone: '01234567892',
      city: 'الإسكندرية',
      area: 'سيدي بشر',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'تنظيف',
    hourPrice: 100,
    verificationStatus: 'verified',
    rankScore: 92,
    appliedJobsCount: 7,
    completedJobsCount: 15,
    createdAt: new Date('2024-01-20'),
    rating: 4.9,
  },
  {
    _id: 'worker4',
    userId: {
      _id: 'user4',
      firstName: 'علي',
      lastName: 'إبراهيم',
      email: 'ali@example.com',
      phone: '01234567893',
      city: 'القاهرة',
      area: 'مدينة نصر',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'دهان',
    hourPrice: 180,
    verificationStatus: 'verified',
    rankScore: 85,
    appliedJobsCount: 4,
    completedJobsCount: 10,
    createdAt: new Date('2024-02-05'),
    rating: 4.2,
  },
  {
    _id: 'worker5',
    userId: {
      _id: 'user5',
      firstName: 'محمود',
      lastName: 'سعيد',
      email: 'mahmoud@example.com',
      phone: '01234567894',
      city: 'الجيزة',
      area: 'المهندسين',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'نجارة',
    hourPrice: 220,
    verificationStatus: 'verified',
    rankScore: 90,
    appliedJobsCount: 6,
    completedJobsCount: 14,
    createdAt: new Date('2024-01-25'),
    rating: 4.5,
  },
];

export const dummyNewWorkers = [
  {
    _id: 'worker6',
    userId: {
      _id: 'user6',
      firstName: 'سليم',
      lastName: 'فارس',
      email: 'salim@example.com',
      phone: '01234567895',
      city: 'القاهرة',
      area: 'الرحاب',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'إصلاح أجهزة',
    hourPrice: 250,
    verificationStatus: 'verified',
    rankScore: 80,
    appliedJobsCount: 2,
    completedJobsCount: 7,
    createdAt: new Date('2024-03-01'),
    rating: 3.9,
  },
  {
    _id: 'worker7',
    userId: {
      _id: 'user7',
      firstName: 'نور',
      lastName: 'كمال',
      email: 'nour@example.com',
      phone: '01234567896',
      city: 'الجيزة',
      area: '6 أكتوبر',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'بناء',
    hourPrice: 300,
    verificationStatus: 'pending',
    rankScore: 75,
    appliedJobsCount: 1,
    completedJobsCount: 3,
    createdAt: new Date('2024-03-05'),
    rating: 4.0,
  },
  {
    _id: 'worker8',
    userId: {
      _id: 'user8',
      firstName: 'فادي',
      lastName: 'عادل',
      email: 'fady@example.com',
      phone: '01234567897',
      city: 'الإسكندرية',
      area: 'المندرة',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'نجارة أثاث',
    hourPrice: 170,
    verificationStatus: 'verified',
    rankScore: 89,
    appliedJobsCount: 6,
    completedJobsCount: 11,
    createdAt: new Date('2024-02-20'),
    rating: 3.5,
  },
  {
    _id: 'worker9',
    userId: {
      _id: 'user9',
      firstName: 'ليلى',
      lastName: 'جمال',
      email: 'layla@example.com',
      phone: '01234567898',
      city: 'القاهرة',
      area: 'التجمع الخامس',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'سباك صحي',
    hourPrice: 190,
    verificationStatus: 'verified',
    rankScore: 91,
    appliedJobsCount: 3,
    completedJobsCount: 9,
    createdAt: new Date('2024-02-25'),
    rating: 4.7,
  },
  {
    _id: 'worker10',
    userId: {
      _id: 'user10',
      firstName: 'مروان',
      lastName: 'فريد',
      email: 'marwan@example.com',
      phone: '01234567899',
      city: 'الجيزة',
      area: 'الشيخ زايد',
      profilePhoto: null,
      userType: 'worker',
    },
    specialty: 'أخرى',
    hourPrice: 120,
    verificationStatus: 'pending',
    rankScore: 60,
    appliedJobsCount: 0,
    completedJobsCount: 1,
    createdAt: new Date('2024-03-10'),
    rating: 3.7,
  },
];

export const dummyServiceRequests = [
  {
    _id: 'job1',
    userId: {
      _id: 'client1',
      firstName: 'فاطمة',
      lastName: 'أحمد',
      email: 'fatima@example.com',
      phone: '01234567895',
      city: 'القاهرة',
      area: 'المعادي',
    },
    problemDescription: 'يوجد تسرب مياه في الحمام الرئيسي، أحتاج صنايعي سباكة لإصلاح المشكلة',
    status: 'pending',
    assignedWorker: null,
    createdAt: new Date('2024-03-15'),
    acceptedAt: null,
  },
  {
    _id: 'job2',
    userId: {
      _id: 'client2',
      firstName: 'سارة',
      lastName: 'محمد',
      email: 'sara@example.com',
      phone: '01234567896',
      city: 'الجيزة',
      area: 'الدقي',
    },
    problemDescription: 'مشكلة في الكهرباء - انقطاع التيار في غرفة المعيشة، أحتاج كهربائي محترف',
    status: 'pending',
    assignedWorker: null,
    createdAt: new Date('2024-03-16'),
    acceptedAt: null,
  },
  {
    _id: 'job3',
    userId: {
      _id: 'client3',
      firstName: 'علي',
      lastName: 'حسن',
      email: 'ali_client@example.com',
      phone: '01234567897',
      city: 'القاهرة',
      area: 'مدينة نصر',
    },
    problemDescription: 'أحتاج تنظيف شامل للشقة قبل الانتقال، مساحة 120 متر مربع',
    status: 'pending',
    assignedWorker: null,
    createdAt: new Date('2024-03-17'),
    acceptedAt: null,
  },
  {
    _id: 'job4',
    userId: {
      _id: 'client4',
      firstName: 'مريم',
      lastName: 'علي',
      email: 'mariam@example.com',
      phone: '01234567898',
      city: 'الإسكندرية',
      area: 'سيدي بشر',
    },
    problemDescription: 'طلاء شقة كاملة - 3 غرف وصالة، أحتاج دهان محترف',
    status: 'pending',
    assignedWorker: null,
    createdAt: new Date('2024-03-18'),
    acceptedAt: null,
  },
  {
    _id: 'job5',
    userId: {
      _id: 'client5',
      firstName: 'يوسف',
      lastName: 'أحمد',
      email: 'youssef@example.com',
      phone: '01234567899',
      city: 'الجيزة',
      area: 'المهندسين',
    },
    problemDescription: 'إصلاح باب خشبي مكسور في المطبخ، أحتاج نجار محترف',
    status: 'pending',
    assignedWorker: null,
    createdAt: new Date('2024-03-19'),
    acceptedAt: null,
  },
  {
    _id: 'job6',
    userId: {
      _id: 'client1',
      firstName: 'فاطمة',
      lastName: 'أحمد',
      email: 'fatima@example.com',
      phone: '01234567895',
      city: 'القاهرة',
      area: 'المعادي',
    },
    problemDescription: 'تم إصلاح تسرب المياه بنجاح',
    status: 'completed',
    assignedWorker: {
      _id: 'worker1',
      userId: {
        _id: 'user1',
        firstName: 'أحمد',
        lastName: 'محمد',
      },
      specialty: 'سباكة',
      hourPrice: 150,
    },
    createdAt: new Date('2024-03-10'),
    acceptedAt: new Date('2024-03-11'),
    updatedAt: new Date('2024-03-12'),
  },
  {
    _id: 'job7',
    userId: {
      _id: 'client2',
      firstName: 'سارة',
      lastName: 'محمد',
      email: 'sara@example.com',
      phone: '01234567896',
      city: 'الجيزة',
      area: 'الدقي',
    },
    problemDescription: 'إصلاح مشكلة الكهرباء في غرفة المعيشة',
    status: 'accepted',
    assignedWorker: {
      _id: 'worker2',
      userId: {
        _id: 'user2',
        firstName: 'محمد',
        lastName: 'علي',
      },
      specialty: 'كهرباء',
      hourPrice: 200,
    },
    createdAt: new Date('2024-03-14'),
    acceptedAt: new Date('2024-03-15'),
  },
  {
    _id: 'job8',
    userId: {
      _id: 'client3',
      firstName: 'علي',
      lastName: 'حسن',
      email: 'ali_client@example.com',
      phone: '01234567897',
      city: 'القاهرة',
      area: 'مدينة نصر',
    },
    problemDescription: 'تنظيف شامل للشقة - مكتمل',
    status: 'completed',
    assignedWorker: {
      _id: 'worker3',
      userId: {
        _id: 'user3',
        firstName: 'خالد',
        lastName: 'حسن',
      },
      specialty: 'تنظيف',
      hourPrice: 100,
    },
    createdAt: new Date('2024-03-05'),
    acceptedAt: new Date('2024-03-06'),
    updatedAt: new Date('2024-03-07'),
  },
];

// Current worker profile (for worker dashboard)
export const dummyCurrentWorker = {
  _id: 'worker1',
  userId: {
    _id: 'user1',
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com',
    phone: '01234567890',
    city: 'القاهرة',
    area: 'المعادي',
    profilePhoto: null,
    userType: 'worker',
  },
  specialty: 'سباكة',
  hourPrice: 150,
  verificationStatus: 'verified',
  rankScore: 95,
  appliedJobsCount: 5,
  completedJobsCount: 12,
  createdAt: new Date('2024-01-15'),
};

// Current user profile (for client jobs page)
export const dummyCurrentUser = {
  id: 'client1',
  _id: 'client1',
  firstName: 'فاطمة',
  lastName: 'أحمد',
  email: 'fatima@example.com',
  phone: '01234567895',
  city: 'القاهرة',
  area: 'المعادي',
  userType: 'user',
};

// Helper function to get dummy data based on context
export const getDummyData = (type, userId = null) => {
  switch (type) {
    case 'workers':
      return [...dummyWorkers, ...dummyNewWorkers];
    case 'jobs':
      if (userId) {
        // Return jobs for specific user
        return dummyServiceRequests.filter(job => job.userId._id === userId);
      }
      // Return all pending jobs for workers
      return dummyServiceRequests.filter(job => job.status === 'pending');
    case 'worker':
      return dummyCurrentWorker;
    case 'user':
      return dummyCurrentUser;
    case 'completed-jobs':
      if (userId) {
        return dummyServiceRequests.filter(
          job => job.status === 'completed' && job.assignedWorker?._id === userId
        );
      }
      return dummyServiceRequests.filter(job => job.status === 'completed');
    case 'active-jobs':
      if (userId) {
        return dummyServiceRequests.filter(
          job => (job.status === 'accepted' || job.status === 'in-progress') && job.assignedWorker?._id === userId
        );
      }
      return dummyServiceRequests.filter(job => job.status === 'accepted' || job.status === 'in-progress');
    default:
      return [];
  }
};

// Initialize dummy user data in localStorage for testing
export const initializeDummyUser = (userType = 'user') => {
  if (userType === 'worker') {
    const workerUser = {
      id: dummyCurrentWorker.userId._id,
      _id: dummyCurrentWorker.userId._id,
      ...dummyCurrentWorker.userId,
      userType: 'worker',
    };
    localStorage.setItem('user', JSON.stringify(workerUser));
    localStorage.setItem('accessToken', 'dummy-worker-token');
    localStorage.setItem('refreshToken', 'dummy-worker-refresh-token');
    return workerUser;
  } else {
    localStorage.setItem('user', JSON.stringify(dummyCurrentUser));
    localStorage.setItem('accessToken', 'dummy-user-token');
    localStorage.setItem('refreshToken', 'dummy-user-refresh-token');
    return dummyCurrentUser;
  }
};

