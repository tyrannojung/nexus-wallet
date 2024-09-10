import { storage } from '@/utils/indexedDb';
import { Member } from '@/types/member';

const updateMemberInfo = async (updatedFields: Partial<Member>): Promise<Member | null> => {
  try {
    const existingMemberInfo: Member | null = await storage.getItem('memberInfo');
    if (existingMemberInfo) {
      const updatedMemberInfo = {
        ...existingMemberInfo,
        ...updatedFields,
      };
      await storage.setItem('memberInfo', updatedMemberInfo);
      return updatedMemberInfo;
    }
    return null;
  } catch (error) {
    console.error('Error updating member info:', error);
    return null;
  }
};

export const memberIndexedDb = { updateMemberInfo };
