import { GetStaticPaths, GetStaticProps } from 'next';
import Head from "next/head";
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {
  const { post } = props;

  console.log(post)

  if (!post) {
    return (
      <>
        <Head>
          <title>Blog| Spacetraveling</title>
        </Head>
        <h1>Carregando...</h1>
      </>
    )
  }
  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>
      <div className={styles.postBanner} style={{ backgroundImage: 'url(https://lirp.cdn-website.com/3775339c/dms3rep/multi/opt/Pessoa+vendo+a+cria%C3%A7%C3%A3o+de+site-1920w.jpg)' }} />
      <main className={commonStyles.container}>
        <article className={styles.postContainer}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.info}>
            <div>
              <FiCalendar />
              <span>{format(
                new Date(post.first_publication_date),
                `dd MMM yyyy`,
                {
                  locale: ptBR,
                }
              )}</span>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock />
              <span>4 min</span>
            </div>
          </div>
          <div className={styles.contentWrap}>
            {post.data.content.map(content => {
              return (
                <section key={content.heading}>
                  <h2>{content.heading}</h2>
                  {content.body.map(paragraph => {
                    return (
                      <p key={paragraph.text}>
                        {paragraph.text}
                      </p>
                    )
                  })}
                </section>
              )
            })}
          </div>
        </article>
      </main>
    </>
  )



}
export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'postagens')
  ],
    {
      fetch: ['postagem'],
      pageSize: 2,

    });

  const slugs = posts.results.map(post => {
    return {
      params: {
        "slug": post.uid,
      }
    }
  });
  return {
    paths: slugs,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('postagens', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content,
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30,
  }
};
