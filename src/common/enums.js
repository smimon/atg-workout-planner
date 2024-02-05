export const BodyPart = {
	Legs: 1,
	Chest: 2,
	Shoulders: 3,
	UpperBack: 4,
	LowerBack: 5,
	Bicep: 6,
	Tricep: 7,
	Wrist: 8,
	Elbow: 9
};

export const ExerciseType = {
	Strength: 1,
	Mobility: 2,
	Conditioning: 3
};

export const ExerciseIntensity = {
	Low: 1,
	Medium: 2,
	High: 3
};

export function enumToOptions(enumType) {
	return Object.entries(enumType).map(x => {
		return {
			value: x[1],
			text: x[0].split(/([A-Z][a-z]+)/).filter(x => x).join(' ')
		}
	});
}