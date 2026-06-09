import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data for idempotency
  console.log('🧹 Cleaning up existing data...');
  try {
    await prisma.grammarCommunityComment.deleteMany();
    await prisma.grammarCommunityPost.deleteMany();
    await prisma.grammarCrowdsourcedQuiz.deleteMany();
    await prisma.userExamSetProgress.deleteMany();
    await prisma.grammarExamSet.deleteMany();
    await prisma.communityGrammarCertificate.deleteMany();
    await prisma.userSrsProgress.deleteMany();
    await prisma.userDailyStreak.deleteMany();
    await prisma.userLevelGraduation.deleteMany();
    await prisma.userGrammarProgress.deleteMany();
    await prisma.grammarLesson.deleteMany();
    await prisma.article.deleteMany();
    await prisma.userGrammarTrap.deleteMany();

    console.log('✅ Cleaned up old database entries.');
  } catch (e) {
    console.log('⚠️ Cleanup warning (might be empty database):', (e as any).message);
  }


  // Create sample articles
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: 'Getting Started with English Learning',
        content: `English is one of the most widely spoken languages in the world. 
        Learning English opens doors to countless opportunities in education, career, and travel. 
        This article will guide you through the basics of starting your English learning journey.`,
        summary: 'An introductory guide to learning English',
        difficulty: 'A1',
        wordCount: 50,
        category: 'Grammar',
        tags: ['beginner', 'introduction', 'basics'],
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Advanced Vocabulary Building Techniques',
        content: `Expanding your vocabulary is crucial for mastering English. 
        This article explores advanced techniques like context-based learning, 
        mnemonics, and spaced repetition to help you remember new words effectively.`,
        summary: 'Techniques for building advanced vocabulary',
        difficulty: 'C1',
        wordCount: 42,
        category: 'Vocabulary',
        tags: ['advanced', 'vocabulary', 'techniques'],
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Business English Essentials',
        content: `Professional communication requires specific vocabulary and expressions. 
        This guide covers essential business English phrases, email etiquette, 
        and presentation skills that will help you succeed in international business.`,
        summary: 'Essential English skills for business professionals',
        difficulty: 'B2',
        wordCount: 38,
        category: 'Business',
        tags: ['business', 'professional', 'intermediate'],
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${articles.length} articles`);

  // Create Grammar Lessons
  console.log('🌱 Seeding grammar lessons...');
  const grammarLessons = await Promise.all([
    prisma.grammarLesson.create({
      data: {
        id: 'conditional-sentences-type-2',
        title: 'Conditional Sentences (Type 2)',
        vietnameseTitle: 'Câu điều kiện loại 2',
        level: 'B2',
        status: 'PUBLISHED',
        tags: ['CONDITIONALS', 'INTERMEDIATE'],
        icon: '📖',
        outline: [
          { id: 'usage', label: 'Usage & Concept', status: 'COMPLETED' },
          { id: 'structure', label: 'Structure', status: 'ACTIVE' },
          { id: 'examples', label: 'Examples in Context', status: 'PENDING' },
          { id: 'quiz', label: 'Knowledge Check', status: 'PENDING' }
        ],
        blocks: [
          {
            id: 'block-media-1',
            type: 'media',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            provider: 'youtube'
          },
          {
            id: 'block-text-1',
            type: 'text',
            content: '### Usage & Concept\n\nType 2 conditional sentences are used to talk about unreal or hypothetical situations in the present or future. We use them to imagine what would happen if a current fact or situation were different.'
          },
          {
            id: 'block-formula-1',
            type: 'formula',
            elements: ['If', '+', 'Past Simple', ',', '...', 'would', '+', 'bare infinitive'],
            note: 'Structure for Type 2 conditional sentence'
          },
          {
            id: 'block-text-2',
            type: 'text',
            content: '### Examples in Context'
          },
          {
            id: 'block-example-1',
            type: 'example',
            items: [
              {
                text: 'If I had a million dollars, I would travel the world.',
                explanation: 'Reality: I don\'t have a million dollars right now.'
              },
              {
                text: 'If she knew his number, she would call him.',
                explanation: 'Reality: She doesn\'t know his number.'
              }
            ]
          },
          {
            id: 'block-callout-1',
            type: 'callout',
            title: "IMPORTANT NOTE: 'WERE' INSTEAD OF 'WAS'",
            content: 'In formal English, it is common to use \'were\' for all subjects (I, he, she, it) in the \'if\' clause of a Type 2 conditional.\n\nExample: *If I were you, I wouldn\'t do that.* (More common/formal than *If I was you*)'
          },
          {
            id: 'block-text-3',
            type: 'text',
            content: '### Knowledge Check'
          },
          {
            id: 'block-quiz-1',
            type: 'quiz',
            question: 'Complete the sentence:\n\n"If I _____ more time, I _____ learn to play the piano."',
            options: ['have / will', 'had / would', 'had / will'],
            answer: 'had / would'
          }
        ]
      }
    }),
    prisma.grammarLesson.create({
      data: {
        id: 'present-perfect-tense',
        title: 'The Present Perfect Tense',
        vietnameseTitle: 'Thì Hiện tại hoàn thành',
        level: 'C1',
        status: 'DRAFT',
        tags: ['TENSES', 'ADVANCED'],
        icon: '🔄',
        outline: [
          { id: 'intro', label: 'Introduction', status: 'COMPLETED' },
          { id: 'formula', label: 'Primary Formula', status: 'ACTIVE' },
          { id: 'verbs', label: 'Common Irregular Verbs', status: 'PENDING' },
          { id: 'usage', label: 'Contextual Usage', status: 'PENDING' },
          { id: 'quiz', label: 'Mini Quiz', status: 'PENDING' }
        ],
        blocks: [
          {
            id: 'block-text-ppt-1',
            type: 'text',
            content: 'The present perfect tense is typically used to express a past event that has present consequences. However, at the C1 level, we must explore its nuanced applications, such as conveying the concept of \'uncompleted time\' or expressing exasperation with adverbs like \'always\' or \'constantly\' in specific regional dialects.'
          },
          {
            id: 'block-formula-ppt-1',
            type: 'formula',
            elements: ['[Subject]', 'Have / Has', '[Past Participle (V3)]'],
            note: 'Add an optional note about this formula...'
          }
        ]
      }
    })
  ]);

  console.log(`✅ Created ${grammarLessons.length} grammar lessons`);

  // Create active user progress for demonstration
  await prisma.userGrammarProgress.create({
    data: {
      userId: 'mock-user-123',
      lessonId: 'conditional-sentences-type-2',
      status: 'IN_PROGRESS',
      proficiency: 50,
      quickNotes: 'Jot down key takeaways here...'
    }
  });
  console.log('✅ Created mock user grammar progress');

  // 1. Create UserDailyStreak for mock-user-123
  console.log('🌱 Seeding daily streak...');
  await prisma.userDailyStreak.create({
    data: {
      userId: 'mock-user-123',
      streakCount: 5,
      lastActiveAt: new Date(),
      totalXP: 350,
    },
  });
  console.log('✅ Created user daily streak');

  // 2. Create UserLevelGraduation for mock-user-123
  console.log('🌱 Seeding level graduation...');
  await prisma.userLevelGraduation.create({
    data: {
      userId: 'mock-user-123',
      level: 'A1',
      isPassed: true,
      bestScore: 92.5,
      certificateUrl: 'https://spark-nexus-ed.edu/certs/mock-user-123-a1.pdf',
    },
  });
  console.log('✅ Created user level graduation');

  // 3. Create GrammarCommunityPosts & Comments
  console.log('🌱 Seeding grammar community posts & comments...');
  const post1 = await prisma.grammarCommunityPost.create({
    data: {
      userId: 'mock-user-123',
      title: '💡 Mẹo nhớ nhanh Câu điều kiện loại 2 (Conditional Type 2)',
      content: 'Để nhớ câu điều kiện loại 2, hãy luôn nhớ quy tắc "Lùi thì" và "Không có thật ở hiện tại". Mệnh đề IF dùng Past Simple (đặc biệt là WERE cho tất cả các ngôi), mệnh đề chính dùng WOULD + V-inf. Ví dụ: *If I were a bird, I would fly everywhere.*',
      likesCount: 18,
      tags: ['CONDITIONALS', 'B2', 'TIPS'],
    },
  });

  await prisma.grammarCommunityComment.createMany({
    data: [
      {
        postId: post1.id,
        userId: 'mock-student-2',
        content: 'Hay quá bác ơi! Trước giờ em cứ hay nhầm was với were trong câu này.',
      },
      {
        postId: post1.id,
        userId: 'mock-teacher-1',
        content: 'Đúng rồi em, ở văn phong trang trọng, "were" luôn là lựa chọn chuẩn sư phạm nhất nhé!',
      },
    ],
  });

  const post2 = await prisma.grammarCommunityPost.create({
    data: {
      userId: 'mock-student-3',
      title: '🔍 Phân biệt nhanh Present Perfect và Simple Past',
      content: 'Nhiều bạn vẫn hay bối rối giữa hai thì này. Hãy nhớ: \n\n1. **Simple Past**: Hành động đã chấm dứt hoàn toàn trong quá khứ, có thời gian xác định (yesterday, last year, in 2020).\n2. **Present Perfect**: Hành động bắt đầu trong quá khứ nhưng kéo dài đến hiện tại, hoặc hành động vừa xảy ra để lại kết quả ở hiện tại (không có thời gian cụ thể).\n\nChúc các bạn học tốt!',
      likesCount: 25,
      tags: ['TENSES', 'C1', 'GRAMMAR'],
    },
  });

  await prisma.grammarCommunityComment.create({
    data: {
      postId: post2.id,
      userId: 'mock-user-123',
      content: 'Bài viết rất chi tiết, cảm ơn bạn nhiều nhé!',
    },
  });
  console.log('✅ Created grammar community posts & comments');

  // 4. Create GrammarCrowdsourcedQuizzes
  console.log('🌱 Seeding crowdsourced quizzes...');
  await prisma.grammarCrowdsourcedQuiz.createMany({
    data: [
      {
        lessonId: 'conditional-sentences-type-2',
        contributorId: 'mock-student-2',
        questionType: 'SENTENCE_BUILDER',
        questionData: {
          words: ['If', 'it', 'rained,', 'we', 'would', 'stay', 'at', 'home.'],
          answer: 'If it rained, we would stay at home.',
        },
        explanation: 'Câu điều kiện loại 2: Mệnh đề IF dùng Past Simple (rained), mệnh đề chính dùng would + bare infinitive (would stay).',
        status: 'APPROVED',
        upvotes: 12,
      },
      {
        lessonId: 'conditional-sentences-type-2',
        contributorId: 'mock-student-3',
        questionType: 'ERROR_SPOTLIGHT',
        questionData: {
          sentence: 'If she has more money, she would buy a new car.',
          incorrectWord: 'has',
          correctWord: 'had',
        },
        explanation: 'Trong câu điều kiện loại 2, mệnh đề IF phải chia ở thì quá khứ đơn (had), không dùng hiện tại đơn (has).',
        status: 'PENDING',
        upvotes: 3,
      },
      {
        lessonId: 'conditional-sentences-type-2',
        contributorId: 'mock-user-123',
        questionType: 'SENTENCE_BUILDER',
        questionData: {
          words: ['If', 'I', 'were', 'rich,', 'I', 'would', 'help', 'them.'],
          answer: 'If I were rich, I would help them.',
        },
        explanation: 'Câu điều kiện loại 2 diễn tả giả định không có thật. Dùng "were" cho tất cả các ngôi trong mệnh đề IF và "would + V" trong mệnh đề chính.',
        status: 'PENDING',
        upvotes: 5,
      },
    ],
  });
  console.log('✅ Created crowdsourced quizzes');

  // 5. Create UserSrsProgress for mock-user-123
  console.log('🌱 Seeding user SRS progress...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.userSrsProgress.create({
    data: {
      userId: 'mock-user-123',
      quizId: 'srs-1', // maps to the first default SRS quiz
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
      dueDate: yesterday, // Due yesterday -> should show up in SRS practice immediately!
    },
  });
  console.log('✅ Created user SRS progress');

  // ============================================
  // SEED CROWDSOURCED PRACTICE EXAM SETS (PHASE 6)
  // ============================================
  console.log('🌱 Seeding crowdsourced practice exam sets...');
  await prisma.grammarExamSet.createMany({
    data: [
      {
        id: 'toeic-exam-set-1',
        title: 'TOEIC Part 5 Grammar Master: Advanced Prepositions & Verb Forms',
        description: 'Bộ đề thi thử bám sát đề thi thật TOEIC Part 5, củng cố sâu về cách sử dụng cụm động từ, mệnh đề danh ngữ và trật tự bổ ngữ phức tạp.',
        level: 'ALL',
        examType: 'TOEIC',
        timeLimit: 600, // 10 minutes
        creatorId: 'mock-teacher-1',
        creatorName: 'Cô Linh TOEIC 990',
        upvotes: 45,
        status: 'APPROVED',
        questions: [
          {
            id: 'tq-1',
            type: 'MULTIPLE_CHOICE',
            text: 'The committee members voted _____ in favor of the newly proposed corporate restructuring plan.',
            options: ['unanimous', 'unanimously', 'unanimity', 'unanimousness'],
            answer: 'unanimously',
            explanation: 'Vị trí này cần một trạng từ (unanimously) để bổ nghĩa cho động từ "voted".',
            category: 'syntax'
          },
          {
            id: 'tq-2',
            type: 'MULTIPLE_CHOICE',
            text: 'Ms. Henderson is highly regarded _____ her innovative approaches to sustainable product packaging design.',
            options: ['for', 'with', 'as', 'to'],
            answer: 'for',
            explanation: 'Cấu trúc "be regarded for something" có nghĩa là được kính trọng/đánh giá cao vì cái gì.',
            category: 'morphology'
          },
          {
            id: 'tq-3',
            type: 'MULTIPLE_CHOICE',
            text: 'Mr. Patterson suggested that the finance department _____ the quarterly budget allocation immediately.',
            options: ['revises', 'revise', 'revised', 'should be revised'],
            answer: 'revise',
            explanation: 'Cấu trúc giả định với động từ "suggest": S1 + suggest + that + S2 + V (bare infinitive).',
            category: 'modality'
          },
          {
            id: 'tq-4',
            type: 'MULTIPLE_CHOICE',
            text: 'We _____ our business operations to three new countries by the end of the next fiscal quarter.',
            options: ['expanded', 'have expanded', 'will have expanded', 'are expanding'],
            answer: 'will have expanded',
            explanation: 'Dấu hiệu "by the end of the next fiscal quarter" chỉ hành động sẽ hoàn thành trước một mốc trong tương lai, nên dùng Tương lai hoàn thành (will have V3).',
            category: 'tenses'
          }
        ] as any
      },
      {
        id: 'ielts-exam-set-1',
        title: 'IELTS Syntactic Inversion & Complex Sentences',
        description: 'Thách thức ngữ pháp nâng cao tương ứng band 7.5 - 9.0 IELTS. Tập trung luyện cấu trúc đảo ngữ phức tạp và mệnh đề phân từ.',
        level: 'ALL',
        examType: 'IELTS',
        timeLimit: 900, // 15 minutes
        creatorId: 'mock-student-3',
        creatorName: 'Khánh Vy IELTS 8.5',
        upvotes: 38,
        status: 'APPROVED',
        questions: [
          {
            id: 'iq-1',
            type: 'SENTENCE_BUILDER',
            text: 'Hãy click chọn các từ để sắp xếp thành câu Đảo Ngữ Phủ Định (Negative Inversion) hoàn chỉnh:',
            words: ['Seldom', 'we', 'witnessed', 'such', 'a', 'breathtaking', 'natural', 'spectacle.', 'have'],
            answer: 'Seldom have we witnessed such a breathtaking natural spectacle.',
            explanation: 'Khi trạng từ phủ định "Seldom" đứng đầu câu, ta đảo trợ động từ lên trước chủ ngữ. Cấu trúc: Seldom + trợ động từ + S + V.',
            category: 'syntax'
          },
          {
            id: 'iq-2',
            type: 'SENTENCE_BUILDER',
            text: 'Hãy click chọn các từ để lắp ráp câu điều kiện loại 3 đảo ngữ (Inversion of Type 3 Conditional):',
            words: ['Had', 'known', 'I', 'the', 'truth,', 'would', 'have', 'acted', 'differently.', 'I'],
            answer: 'Had I known the truth, I would have acted differently.',
            explanation: 'Đảo ngữ câu điều kiện loại 3: Thay vì "If I had known", ta bỏ If và đảo Had lên đầu: Had + S + V3.',
            category: 'syntax'
          }
        ] as any
      },
      {
        id: 'vstep-exam-set-1',
        title: 'VSTEP B2-C1 Error Spotlight Diagnostic Test',
        description: 'Bài kiểm tra sửa lỗi sai ngữ pháp nâng cao cực kỳ hiệu quả bám sát kỳ thi VSTEP bậc 4-5 dùng cho sinh viên đại học.',
        level: 'ALL',
        examType: 'VSTEP',
        timeLimit: 600, // 10 minutes
        creatorId: 'mock-teacher-1',
        creatorName: 'Thầy Cường VSTEP',
        upvotes: 29,
        status: 'APPROVED',
        questions: [
          {
            id: 'vq-1',
            type: 'ERROR_SPOTLIGHT',
            text: 'Click vào từ viết sai ngữ pháp trong câu dưới đây và gõ từ sửa lại đúng trên ô nhập liệu:',
            sentence: 'The pollution in the city has become seriously since the factories opened.',
            incorrectWord: 'seriously',
            correctWord: 'serious',
            answer: 'serious',
            explanation: 'Sau động từ liên kết "become" ta phải dùng tính từ (serious) thay vì trạng từ (seriously).',
            category: 'morphology'
          },
          {
            id: 'vq-2',
            type: 'ERROR_SPOTLIGHT',
            text: 'Tìm lỗi ngữ pháp trong câu điều kiện hỗn hợp dưới đây và viết lại từ đúng:',
            sentence: 'If he had worked harder yesterday, he would has passed the exam today.',
            incorrectWord: 'has',
            correctWord: 'have',
            answer: 'have',
            explanation: 'Mệnh đề chính của câu điều kiện hỗn hợp chia ở Would + V-inf, nên ta dùng "would have passed" chứ không dùng "has".',
            category: 'syntax'
          }
        ] as any
      },
      {
        id: 'cefr-exam-set-1',
        title: 'CEFR A2 Basic Tenses and Structural Drills',
        description: 'Bài kiểm tra cơ bản dành cho trình độ A2 để nắm vững cấu trúc Hiện tại tiếp diễn, Quá khứ đơn và danh từ đếm được.',
        level: 'A2',
        examType: 'CEFR',
        timeLimit: 300, // 5 minutes
        creatorId: 'mock-student-2',
        creatorName: 'Minh Nhật A2',
        upvotes: 15,
        status: 'APPROVED',
        questions: [
          {
            id: 'cq-1',
            type: 'MULTIPLE_CHOICE',
            text: 'Right now, my brother _____ his English homework in his bedroom.',
            options: ['is doing', 'does', 'did', 'was doing'],
            answer: 'is doing',
            explanation: 'Trạng từ "Right now" chỉ hành động đang diễn ra tại thời điểm nói, chia ở Hiện tại tiếp diễn.',
            category: 'tenses'
          },
          {
            id: 'cq-2',
            type: 'MULTIPLE_CHOICE',
            text: 'Yesterday, we _____ to the library to borrow some grammar textbooks.',
            options: ['go', 'went', 'gone', 'are going'],
            answer: 'went',
            explanation: 'Trạng từ quá khứ "Yesterday" chỉ hành động đã xảy ra trong quá khứ, chia ở Quá khứ đơn (went).',
            category: 'tenses'
          }
        ] as any
      }
    ]
  });
  console.log('✅ Created 4 standardized multi-certificate crowdsourced grammar exam sets!');

  // ============================================
  // SEED USER GRAMMAR TRAPS (PHASE 7)
  // ============================================
  console.log('🌱 Seeding mock user grammar traps...');
  await prisma.userGrammarTrap.createMany({
    data: [
      {
        userId: 'mock-user-123',
        questionId: 'seed-trap-1',
        questionText: 'The committee members voted _____ in favor of the newly proposed corporate restructuring plan.',
        questionType: 'MULTIPLE_CHOICE',
        questionData: {
          options: ['unanimous', 'unanimously', 'unanimity', 'unanimousness']
        } as any,
        category: 'syntax',
        userAnswer: 'unanimous',
        correctAnswer: 'unanimously',
        explanation: 'Vị trí này cần một trạng từ (unanimously) để bổ nghĩa cho động từ "voted".',
        status: 'TRAPPED',
      },
      {
        userId: 'mock-user-123',
        questionId: 'seed-trap-2',
        questionText: 'He has been studying English since five years now.',
        questionType: 'ERROR_SPOTLIGHT',
        questionData: {
          sentence: 'He has been studying English since five years now.',
          incorrectWord: 'since',
          correctWord: 'for'
        } as any,
        category: 'morphology',
        userAnswer: 'since',
        correctAnswer: 'for',
        explanation: 'Khoảng thời gian (five years) đi kèm với giới từ "for", còn mốc thời gian mới đi kèm với "since".',
        status: 'TRAPPED',
      }
    ]
  });
  console.log('✅ Seeding 2 sample user grammar traps for mock-user-123!');

  console.log('🎉 Seeding completed!');
}


main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
