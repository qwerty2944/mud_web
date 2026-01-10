/**
 * Proficiency feature stub
 * NOTE: Proficiency system is deprecated and will be replaced by passive skills.
 */

interface GainProficiencyParams {
  type: string;
  amount: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useGainProficiency(_userId: string | undefined) {
  return {
    mutate: (_params: GainProficiencyParams) => {},
    mutateAsync: async (_params: GainProficiencyParams) => {},
    isPending: false,
  };
}
