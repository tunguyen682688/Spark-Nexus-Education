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
    console.log('⚠️ Cleanup warning (might be empty database):', (e as Error).message);
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
        title: 'Global Tech Innovations 2026',
        content: `A deep dive into the latest technological advancements shaping our future. From AI to quantum computing, stay updated with the fastest growing sector.`,
        summary: 'Latest tech innovations globally.',
        difficulty: 'C1',
        wordCount: 300,
        category: 'news',
        tags: ['technology', 'news', 'future'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Breakthrough in Renewable Energy',
        content: `Scientists have developed a new solar panel technology that is 50% more efficient than current models. This could revolutionize the way we harness the sun's energy.`,
        summary: 'New solar panel technology.',
        difficulty: 'B2',
        wordCount: 250,
        category: 'news',
        tags: ['environment', 'news', 'energy'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1509391366360-1f9509e1f16e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'The Science of Phonetics in Language Learning',
        content: `Phonetics is the study of speech sounds, their production, and perception. In language learning, mastering phonetics is key to accurate pronunciation and accent reduction. By understanding speech apparatus and phonetic transcriptions (IPA), students can self-correct and speak with greater confidence.`,
        summary: 'How phonetics improves pronunciation in foreign languages.',
        difficulty: 'B1',
        wordCount: 280,
        category: 'news',
        tags: ['phonetics', 'news', 'pronunciation'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'AI in Education: Customizing the Classroom',
        content: `Artificial Intelligence is transforming classrooms worldwide. Modern AI tools analyze student performance in real-time, adapting curricula to address individual weaknesses. This custom learning experience improves engagement and helps students learn English at their own optimal pace.`,
        summary: 'AI-driven personalized learning systems are reshaping education.',
        difficulty: 'B2',
        wordCount: 320,
        category: 'news',
        tags: ['ai in education', 'news', 'technology'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Quantum Computing Reaches Crucial Milestone',
        content: `Physicists have achieved quantum supremacy in a new error-corrected processor. This breakthrough brings us closer to solving complex molecular simulations and cryptography challenges that are impossible on classical supercomputers, marking a massive leap for quantum mechanics.`,
        summary: 'A new milestone in error-correction for quantum computing.',
        difficulty: 'C1',
        wordCount: 410,
        category: 'news',
        tags: ['quantum computing', 'news', 'technology'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Mars Rover Discovers Traces of Ancient Water',
        content: `NASA's latest Mars explorer has uncovered rock samples containing minerals that only form in the presence of liquid water. This discovery strongly supports the hypothesis that ancient Mars had stable lakes and rivers, suggesting the planet could once have harbored microbial life.`,
        summary: 'Rock samples on Mars suggest ancient habitable lakes.',
        difficulty: 'C2',
        wordCount: 350,
        category: 'news',
        tags: ['science', 'space', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Global Economic Outlook 2026',
        content: `Central banks are navigating a complex landscape of inflation stabilization and interest rate adjustments. Analysts predict moderate growth for developing nations, while technological sectors continue to dominate investment trends globally, shaping international trade routes.`,
        summary: 'Analyzing central bank policies and global market trends.',
        difficulty: 'C1',
        wordCount: 300,
        category: 'news',
        tags: ['business', 'finance', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Artistic Revival in the Digital Age',
        content: `Traditional painters are embracing digital mediums and blockchain platforms to share and sell their work. This integration has birthed a new wave of hybrid galleries, where physical paintings are accompanied by immersive virtual reality exhibits, redefining creative boundaries.`,
        summary: 'How digital technology is blending with traditional art mediums.',
        difficulty: 'B1',
        wordCount: 260,
        category: 'news',
        tags: ['arts', 'culture', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'The Rise of Green Cities',
        content: `Metropolitan areas are implementing eco-friendly architectures, including rooftop gardens, electric transit fleets, and smart recycling bins. These green initiatives decrease carbon footprints and improve urban quality of life, proving that industrial progress can align with sustainability.`,
        summary: 'Smart environmental architectures are transforming urban centers.',
        difficulty: 'B2',
        wordCount: 275,
        category: 'news',
        tags: ['environment', 'sustainability', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Exploring Deep Ocean Trenches',
        content: `A robotic submarine has successfully recorded high-definition footage of unknown organisms at the bottom of the Mariana Trench. These creatures possess bioluminescent adaptations that survive intense pressure and total darkness, opening new frontiers in deep-sea biology.`,
        summary: 'New species discovered at extreme ocean depths.',
        difficulty: 'A2',
        wordCount: 290,
        category: 'news',
        tags: ['science', 'ocean', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Healthy Eating Tips for Busy Students',
        content: `Maintaining a balanced diet is challenging for students balancing study and work. Experts recommend meal prepping, staying hydrated, and choosing nutrient-rich snacks like nuts and fruits over processed sugars to keep cognitive performance at its peak during exams.`,
        summary: 'Simple nutritional strategies to support focus and energy.',
        difficulty: 'A1',
        wordCount: 240,
        category: 'news',
        tags: ['lifestyle', 'health', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'The Future of Renewable Energy Networks',
        content: `Smart grids powered by solar wind and ocean tides are replacing coal power stations in northern Europe. Innovative storage batteries help stabilize supply during low-generation days, creating a resilient clean energy infrastructure that could solve energy security crises.`,
        summary: 'Integration of renewable grids and battery storage.',
        difficulty: 'B2',
        wordCount: 280,
        category: 'news',
        tags: ['environment', 'energy', 'news'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'The Great Gatsby - Chapter 1',
        content: `In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.`,
        summary: 'Classic novel chapter 1 excerpt.',
        difficulty: 'B2',
        wordCount: 500,
        category: 'book',
        tags: ['classic', 'literature', 'novel'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Pride and Prejudice - Chapter 1',
        content: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.`,
        summary: 'Classic novel chapter 1 excerpt.',
        difficulty: 'C1',
        wordCount: 450,
        category: 'book',
        tags: ['classic', 'literature', 'novel'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'My Journey to Bilingualism',
        content: `Learning a second language is never easy, but the rewards are immense. Here is my personal story of how I mastered a new tongue.`,
        summary: 'Personal blog about language learning.',
        difficulty: 'B1',
        wordCount: 250,
        category: 'blog',
        tags: ['personal', 'language', 'blog'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Top 10 Tips for Effective Studying',
        content: `Studying effectively is more than just reading textbooks. It involves active recall, spaced repetition, and maintaining a healthy lifestyle.`,
        summary: 'Tips for effective studying.',
        difficulty: 'A2',
        wordCount: 300,
        category: 'blog',
        tags: ['education', 'tips', 'study'],
        isPublished: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Principles of Cognitive Neuroscience',
        content: `A comprehensive textbook on neuroscience and cognitive functions, discussing sensory systems, motor controls, memory systems, executive functions, and brain mapping techniques.`,
        summary: `A landmark text on neuroscientific principles and cognitive architecture.`,
        difficulty: 'C1',
        wordCount: 840,
        category: 'academic',
        tags: ['Neuroscience', 'Biology', 'Cognition'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop',
        author: 'Dale Purves, et al.',
        viewCount: 4200,
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Modernist Literature and the Crisis of Representation',
        content: `Explores the fractured narratives, stream of consciousness, and complex aesthetics of early 20th-century literature. Discusses Virginia Woolf, James Joyce, and key literary innovations.`,
        summary: `Dr. Sarah Jenkins explores the fractured narratives and complex aesthetics of the early 20th century in this definitive masterclass text.`,
        difficulty: 'C2',
        wordCount: 412,
        category: 'academic',
        tags: ['Literature', 'History', 'Arts'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
        author: 'Dr. Sarah Jenkins',
        viewCount: 1800,
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Introduction to Quantum Mechanics',
        content: `An introductory guide to quantum physics, detailing wavefunctions, Schrodinger's equation, potential wells, angular momentum, and hydrogenic systems.`,
        summary: `A classic textbook introducing the mathematical foundations and physical interpretations of quantum mechanics.`,
        difficulty: 'B2',
        wordCount: 510,
        category: 'academic',
        tags: ['Physics', 'Science', 'Quantum'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop',
        author: 'David J. Griffiths',
        viewCount: 8500,
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Computational Linguistics',
        content: `Investigates natural language processing algorithms, parsing techniques, syntactic analysis, machine translation, neural language models, and syntax representations.`,
        summary: `Core theoretical insights and practical applications of natural language computation.`,
        difficulty: 'C1',
        wordCount: 320,
        category: 'academic',
        tags: ['Comp Sci', 'Technology', 'Linguistics'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
        author: 'Alan Turing',
        viewCount: 1100,
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'Advanced Macroeconomics',
        content: `Analyzes modern macroeconomic growth theories, dynamic general equilibrium systems, fiscal policies, monetary tools, inflation, and financial markets.`,
        summary: `Standard graduate-level macroeconomic models and empirical foundations.`,
        difficulty: 'C1',
        wordCount: 490,
        category: 'academic',
        tags: ['Economics', 'Finance'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
        author: 'David Romer',
        viewCount: 3200,
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.article.create({
      data: {
        title: 'The Philosophy of Space and Time',
        content: `Explores the epistemological and ontological foundations of spacetime theories, relativistic geometry, temporal order, causation, and physical topology.`,
        summary: `An investigation into the relativistic concepts of geometry, temporal flows, and cosmic structure.`,
        difficulty: 'C2',
        wordCount: 380,
        category: 'academic',
        tags: ['Philosophy', 'Physics'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop',
        author: 'Hans Reichenbach',
        viewCount: 2900,
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

  const quantumMechBook = articles.find(a => a.title === 'Introduction to Quantum Mechanics');
  const cognitiveNeuroBook = articles.find(a => a.title === 'Principles of Cognitive Neuroscience');

  if (quantumMechBook && cognitiveNeuroBook) {
    await prisma.readingProgress.create({
      data: {
        userId: 'mock-user-123',
        articleId: quantumMechBook.id,
        progress: 68,
        lastPosition: 100,
        timeSpent: 3600,
      }
    });

    await prisma.readingProgress.create({
      data: {
        userId: 'mock-user-123',
        articleId: cognitiveNeuroBook.id,
        progress: 32,
        lastPosition: 50,
        timeSpent: 1800,
      }
    });
    console.log('✅ Created mock user reading progress for academic books');
  }

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
