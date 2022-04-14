import * as prismicH from '@prismicio/helpers';
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link';
import { createClient } from '../../services/prismic';

import styles from './styles.module.scss'

type Post = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        // eslint-disable-next-line react/jsx-key
                        <Link href={`/posts/preview/${post.slug}`}>
                            <a key={post.id}>
                                <time>
                                    {post.updatedAt}
                                </time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
    const client = createClient({ previewData })

    const response = await client.getAllByType('post')

    const posts = response.map(post => {
        return {
            id: post.id,
            slug: post.uid,
            title: prismicH.asText(post.data.title),
            excerpt: prismicH.asText(post.data.content).substring(0, 250).concat("..."),
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: {
            posts
        },
        revalidate: 60 * 30 // 30 minutes
    }
}