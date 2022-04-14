import Head from "next/head";
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react";

import * as prismicT from '@prismicio/types';
import * as prismicH from '@prismicio/helpers';
import { PrismicRichText } from "@prismicio/react";

import { createClient } from "../../services/prismic";

import styles from './post.module.scss'

interface PostProps {
    post: {
        id: string;
        slug: string;
        title: string;
        content: [prismicT.RTNode];
        updatedAt: string;
    }
}

export default function Post({ post }: PostProps) {
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div className={styles.postContent}>
                        <PrismicRichText field={post.content} />
                    </div>
                </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({ req });
    const { slug } = params;

    if (!session?.activeSubscription) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const prismic = createClient(req);

    const response = await prismic.getByUID('post', String(slug));

    const post = {
        id: response.id,
        slug: response.uid,
        title: prismicH.asText(response.data.title),
        content: response.data.content,
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