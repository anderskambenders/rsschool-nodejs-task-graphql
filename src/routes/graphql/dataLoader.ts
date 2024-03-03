import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';


class AppDataLoader {
  member: DataLoader<string, MemberType | undefined>;
  user: DataLoader<string, User | undefined>;
  subscribed: DataLoader<string, User[] | undefined>;
  subscribers: DataLoader<string, User[] | undefined>;
  post: DataLoader<string, Post | undefined>;
  userPosts: DataLoader<string, Post[] | undefined>;
  profile: DataLoader<string, Profile | undefined>;
  userProfile: DataLoader<string, Profile | undefined>;

  constructor(prismaClient: PrismaClient) {
    this.member = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.memberType.findMany({
        where: { id: { in: ids as string[] } },
      });
      const result = ids.map((id) => data.find((val) => id === val.id));
      return result;
    });
    this.user = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.user.findMany({ where: { id: { in: ids as string[] } } });
      const result = ids.map((id) => data.find((val) => id === val.id))
      return result;
    });
    this.subscribers = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.subscribersOnAuthors.findMany({
        where: { authorId: { in: ids as string[] } },
        select: { subscriber: true, authorId: true },
      });
      const result = ids.map((id) =>
      data.filter((sub) => id === sub.authorId).map((sub) => {
          this.user.prime(sub.subscriber.id, sub.subscriber);
          return sub.subscriber;
        }),
    );
      return result
    });
    this.subscribed = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: ids as string[] } },
        select: { author: true, subscriberId: true },
      });
      const result = ids.map((id) =>
      data.filter((subs) => id === subs.subscriberId).map((subs) => {
          this.user.prime(subs.author.id, subs.author);
          return subs.author;
        }),
    );
      return result
    });
    this.profile = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.profile.findMany({ where: { id: { in: ids as string[] } } });
      const result =ids.map((id) => data.find((val) => id === val.id))
      return result;
    });
    this.userProfile = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.profile.findMany({
        where: { userId: { in: ids as string[] } },
      });
      const result = ids.map((id) => data.find((post) => id === post.userId))
      return  result;
    });
    this.post = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.post.findMany({ where: { id: { in: ids as string[] } } });
      const result = ids.map((id) => data.find((val) => id === val.id))
      return result;
    });
    this.userPosts = new DataLoader(async (ids: Readonly<string[]>) => {
      const data = await prismaClient.post.findMany({
        where: { authorId: { in: ids as string[] } },
      });
      const result = ids.map((id) => data.filter((post) => id === post.authorId))
      return result ;
    });
  }
}
export default AppDataLoader;