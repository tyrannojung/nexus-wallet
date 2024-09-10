import { storage } from '@/utils/indexedDb';
import { Member } from '@/types/member';

const updateMemberInfo = async (updatedFields: Partial<Member>): Promise<Member> => {
  try {
    const existingMemberInfo: Member | null = await storage.getItem('memberInfo');
    const updatedMemberInfo = existingMemberInfo
      ? { ...existingMemberInfo, ...updatedFields }
      : (updatedFields as Member);

    await storage.setItem('memberInfo', updatedMemberInfo);
    return updatedMemberInfo;
  } catch (error) {
    console.error('Error updating member info:', error);
    throw error;
  }
};

export const memberIndexedDb = { updateMemberInfo };
