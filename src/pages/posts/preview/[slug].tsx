import Head from "next/head";
import { GetStaticProps } from "next"
import { getSession, useSession } from "next-auth/react";

import * as prismicT from '@prismicio/types';
import * as prismicH from '@prismicio/helpers';
import { PrismicRichText } from "@prismicio/react";

import { createClient } from "../../../services/prismic";

import styles from '../post.module.scss'
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface PostPreviewProps {
    post: {
        id: string;
        slug: string;
        title: string;
        content: [prismicT.RTNode];
        updatedAt: string;
    }
}

export default function Post({ post }: PostPreviewProps) {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    }, [session])

    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div className={`${styles.postContent} ${styles.previewContent}`}>
                        <PrismicRichText field={post.content} />
                    </div>

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href="/home">
                            <a href="">Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params;

    const prismic = createClient();

    const response = await prismic.getByUID('post', String(slug));

    const post = {
        id: response.id,
        slug: response.uid,
        title: prismicH.asText(response.data.title),
        content: response.data.content.splice(0, 3),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return {
        props: {
            post
        }
    }
}