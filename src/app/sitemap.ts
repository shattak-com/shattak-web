import { MetadataRoute } from 'next'
import type { LandingCourseCard } from '~/lib/firebase/courses';


type CoursesSectionProps = {
	courses: LandingCourseCard[];
};



// Example function to fetch all course slugs.
// You should replace this with your real API call.
async function getAllCourses() {
  try {
    const res = await fetch('https://shattak.com/api/courses')
    // Make sure your API returns something like:
    // [{ slug: 'course-1', updatedAt: '2026-02-01' }, ...]
    if (!res.ok) return []
    return await res.json()
  } catch (err) {
    console.error('Failed to fetch courses for sitemap', err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = [
  { slug: 'ids', updatedAt: '2026-02-01' },
  { slug: 'courses', updatedAt: '2026-02-01' },
  { slug: 'a7xk2m9qwr8t5yup3lzd', updatedAt: '2026-02-01' },
  { slug: 'aaaqqq', updatedAt: '2026-02-01' },
  { slug: 'bn6cvlq8wxrsdk3yptz7', updatedAt: '2026-02-01' },
  { slug: 'c7v9b2n5m1q8w4xk3zrt', updatedAt: '2026-02-01' },
  { slug: 'd3v8b1n6m4q9w2xk7zry', updatedAt: '2026-02-01' },
  { slug: 'dddeee', updatedAt: '2026-02-01' },
  { slug: 'g9t2r8w4q1z7m3x6kvpl', updatedAt: '2026-02-01' },
  { slug: 'gggttt', updatedAt: '2026-02-01' },
  { slug: 'h7k2m9q4xv8t1p3lwr6z', updatedAt: '2026-02-01' },
  { slug: 'iiikkk', updatedAt: '2026-02-01' },
  { slug: 'jjjuuu', updatedAt: '2026-02-01' },
  { slug: 'k4f92lmxaqw8ztyp3bnc', updatedAt: '2026-02-01' },
  { slug: 'lllooo', updatedAt: '2026-02-01' },
  { slug: 'lm4xazk9qw8erty2uiop', updatedAt: '2026-02-01' },
  { slug: 'm8k2zq4xv9t1p3lwr6ay', updatedAt: '2026-02-01' },
  { slug: 'nnnbbb', updatedAt: '2026-02-01' },
  { slug: 'op9lm2xazk5qwerty7ui', updatedAt: '2026-02-01' },
  { slug: 'p4l9x2k7zq8w3m1t6rvy', updatedAt: '2026-02-01' },
  { slug: 'ppppmmmm', updatedAt: '2026-02-01' },
  { slug: 'q7wert9uioplm2xazk3b', updatedAt: '2026-02-01' },
  { slug: 'rrrfff', updatedAt: '2026-02-01' },
  { slug: 'rs2dk7yptz9lmxaqw4er', updatedAt: '2026-02-01' },
  { slug: 't9r2w8q4z1m7x3k6vplc', updatedAt: '2026-02-01' },
  { slug: 'ty8uiop5lm2xazk7qwer', updatedAt: '2026-02-01' },
  { slug: 'u4p9l2x7k3z8q1m6tvrw', updatedAt: '2026-02-01' },
  { slug: 'vB1oWEZvN1Iff6bO6J6z', updatedAt: '2026-02-01' },
  { slug: 'vvvccc', updatedAt: '2026-02-01' },
  { slug: 'wwwsss', updatedAt: '2026-02-01' },
  { slug: 'wx3rsdk6yptz8bncvlq4', updatedAt: '2026-02-01' },
  { slug: 'x3m8q1z7v4t9k2w6rply', updatedAt: '2026-02-01' },
  { slug: 'xxxzzz', updatedAt: '2026-02-01' },
  { slug: 'y3x8m1q7z4v9t2k6rplw', updatedAt: '2026-02-01' },
  { slug: 'yyyhhh', updatedAt: '2026-02-01' },
  { slug: 'z8t3ypbncv4lq5wxrsk2', updatedAt: '2026-02-01' },
  { slug: 'zzzzzzzaaaaaaaa', updatedAt: '2026-02-01' }
];

  const courseUrls = courses.map((course: any) => ({
    url: `https://shattak.com/course/${course.slug}`,
    lastModified: new Date(course.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://shattak.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // you can add additional static pages here if needed
    ...courseUrls,
  ]
}