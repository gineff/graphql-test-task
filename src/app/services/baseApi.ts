import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import { gql } from 'graphql-request';
import { RepositoriesResponse, RepositoriesQueryArgs } from './types';

/** RTK Query Api */
const githubToken = import.meta.env.VITE_GITHUB_TOKEN;

export const api = createApi({
  reducerPath: 'githubApi',
  baseQuery: graphqlRequestBaseQuery({
    url: 'https://api.github.com/graphql',
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${githubToken}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRepositories: builder.query<RepositoriesResponse, RepositoriesQueryArgs>(
      {
        query: ({ query, limit, after, before }) => ({
          document: gql`
            query SearchRepositories(
              $query: String!
              $limit: Int!
              $before: String
              $after: String
            ) {
              search(
                query: $query
                type: REPOSITORY
                ${before ? 'last' : 'first'}: $limit
                after: $after
                before: $before
              ) {
                repositoryCount

                edges {
                  node {
                    ... on Repository {
                      id
                      name
                      primaryLanguage {
                        name
                      }
                      stargazerCount
                      forkCount
                      updatedAt
                    }
                  }
                }

                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          `,
          variables: {
            query,
            limit,
            after,
            before,
          },
        }),
      }
    ),
  }),
});

export const { useGetRepositoriesQuery } = api;
