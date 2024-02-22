export type ProductHuntProduct = typeof sampleProductHuntProduct;

const sampleProductHuntProduct = {
  __typename: 'Product',
  id: '554225',
  description:
    "Introducing SpeedVitals, the next generation of web performance testing. SpeedVitals is a powerful website testing tool aimed at improving Core Web Vitals. It provides performance insights to help improve your website's speed.",
  reviewsCount: 4,
  reviewsRating: 5,
  slug: 'speedvitals',
  isMaker: false,
  isViewerTeamMember: null,
  stacksCount: 14,
  stackers: {
    __typename: 'UserConnection',
    edges: [
      {
        __typename: 'UserEdge',
        node: {
          __typename: 'User',
          id: '3832544',
          name: 'Kashish Kumawat',
          username: 'kashishkumawat',
          avatarUrl:
            'https://ph-avatars.imgix.net/3832544/7a26ea55-97dd-4a48-b4f1-2a783d066d20',
        },
      },
      {
        __typename: 'UserEdge',
        node: {
          __typename: 'User',
          id: '2820589',
          name: 'Rohan Rajpal',
          username: 'rohanrajpal',
          avatarUrl:
            'https://ph-avatars.imgix.net/2820589/a9b72a24-bbcd-44d7-aae2-099e6c62ebf0',
        },
      },
      {
        __typename: 'UserEdge',
        node: {
          __typename: 'User',
          id: '3510967',
          name: 'Abhishek Gupta',
          username: 'abhishek_gupta15',
          avatarUrl:
            'https://ph-avatars.imgix.net/3510967/82e59ba3-0211-4f7c-95df-87e481fe6e4c',
        },
      },
    ],
  },
  websiteUrl: 'https://speedvitals.com',
  name: 'SpeedVitals',
  logoUuid: 'e708318e-f9e0-4b97-a917-c263a46bf0e0.png',
  isNoLongerOnline: false,
  isStacked: false,
};
