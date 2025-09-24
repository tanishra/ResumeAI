import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobTitle = formData.get('jobTitle') as string;
    const jobDescription = formData.get('jobDescription') as string;

    // Here you would integrate with your existing CrewAI pipeline
    // For now, we'll return mock data
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockResults = {
      cleaned: `JOHN DOE
Software Engineer

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

EXPERIENCE
Software Engineer | Tech Company | 2022-Present
• Developed and maintained web applications using React and Node.js
• Collaborated with cross-functional teams to deliver high-quality software solutions
• Implemented automated testing procedures to improve code reliability

Junior Developer | StartupCo | 2020-2022
• Built responsive web interfaces using HTML, CSS, and JavaScript
• Participated in agile development processes and sprint planning
• Contributed to database design and optimization efforts`,

      rewritten: `JOHN DOE
${jobTitle}

CONTACT INFORMATION
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL EXPERIENCE
Software Engineer | Tech Company | 2022-Present
• Engineered scalable web applications using React.js and Node.js, serving 100K+ users
• Collaborated with product managers and UX designers to deliver feature-rich solutions
• Implemented comprehensive testing strategies, reducing bugs by 40%
• Optimized application performance, improving load times by 25%

Junior Software Developer | StartupCo | 2020-2022  
• Developed responsive user interfaces using modern JavaScript frameworks
• Participated in Agile/Scrum methodologies, contributing to 15+ successful sprints
• Designed and optimized database schemas for improved query performance
• Mentored 2 junior developers in best coding practices`,

      final_resume: `JOHN DOE
${jobTitle}

CONTACT INFORMATION
Email: john.doe@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Software Engineer with 3+ years developing scalable web applications and leading cross-functional initiatives. Proven track record of delivering high-impact solutions that improve user experience and system performance.

TECHNICAL SKILLS
• Programming Languages: JavaScript, Python, Java, TypeScript
• Frontend Technologies: React.js, Vue.js, HTML5, CSS3, Responsive Design
• Backend Technologies: Node.js, Express.js, RESTful APIs, GraphQL
• Databases: PostgreSQL, MongoDB, Redis
• Tools & Platforms: Git, Docker, AWS, Jenkins, Agile/Scrum

PROFESSIONAL EXPERIENCE

Software Engineer | Tech Company | March 2022 - Present
• Architected and deployed 5+ full-stack web applications using React.js and Node.js, supporting 100,000+ active users
• Collaborated with product managers, designers, and stakeholders to define requirements and deliver customer-focused solutions
• Implemented automated testing frameworks (Jest, Cypress), reducing production bugs by 40% and improving deployment confidence
• Optimized application performance through code splitting and lazy loading, achieving 25% improvement in page load speeds
• Led technical mentoring initiatives for 3 junior developers, establishing coding standards and best practices

Junior Software Developer | StartupCo | June 2020 - February 2022
• Developed responsive, mobile-first user interfaces using modern JavaScript frameworks and CSS preprocessors
• Actively participated in Agile/Scrum ceremonies, contributing to 15+ successful sprint deliveries with 98% on-time completion
• Designed and optimized PostgreSQL database schemas, improving query performance by 30%
• Built and maintained RESTful APIs serving critical business functions for customer management system
• Contributed to code reviews and documentation, ensuring maintainable and scalable codebase

EDUCATION
Bachelor of Science in Computer Science | University Name | 2020`,

      evaluation: {
        overall_score: 85,
        scores: {
          keyword_optimization: 88,
          format_compliance: 82,
          content_quality: 87,
          ats_compatibility: 85,
          impact_metrics: 90
        },
        suggestions: [
          "Add more quantifiable achievements with specific metrics",
          "Include relevant certifications if available",
          "Consider adding a projects section to showcase technical skills",
          "Ensure all job descriptions include action verbs and measurable outcomes"
        ]
      }
    };

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}