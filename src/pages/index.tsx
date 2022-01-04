import { FiCalendar, FiUser } from "react-icons/fi";
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';

import Head from "next/head";
import Link from 'next/link'
import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  const [nextPage, setNextPage] = useState(props.postsPagination.next_page)
  const [posts, setPosts] = useState(props.postsPagination.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        `dd MMM yyyy`,
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  }));


  function handleGoToNextPage() {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        setPosts(data.results.map((post: Post) => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              `dd MMM yyyy`,
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        }));
        setNextPage(data.next_page);
      });
  }


  return (
    <>
      <Head>
        <title>Posts | Spacetraveling</title>
      </Head>
      <section className={commonStyles.container}>
        <div className={styles.postContainer}>
          {posts.map((post: Post) => {
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <h4>{post.data.subtitle}</h4>
                  <div className={styles.info}>
                    <div>
                      <FiCalendar />
                      <span>{post.first_publication_date}</span>
                    </div>
                    <div>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            )
          })}
          {nextPage != null ? <button onClick={handleGoToNextPage}>Carregar mais posts</button> : ''}
        </div>
      </section>
    </>

  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'postagens')
  ],
    {
      fetch: ['postagem'],
      pageSize: 1,

    });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results
      }
    }
  }
};
