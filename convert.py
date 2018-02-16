import json



# with open("noms.txt") as f:
#     content = f.readlines()

f = open("2018.txt")
newOne = open('nomnom2018.json', 'w')

newAwardNext = True
awards = []


# f.readline()


for line in f:
	if line == '\n':
		newAwardNext = True

		awards.append(award)
	elif newAwardNext:
		title = line.rstrip('\n')
		award = {'award': title, 'nominees': [], 'points': 1}

		newAwardNext = False
	else:
		nom = line.rstrip('\n')
		nom = nom.split('|')

		if len(nom) == 1:
			nom = {'film': nom[0].strip(), 'nominee': ""}
		else:
			nom = {'film': nom[1].strip(), 'nominee': nom[0].strip()}

		award['nominees'].append(nom)
	

	# if line[:4] == 'Best':
	# 	if first:
	# 		first = False
	# 	else:
	# 		awards.append(award)
			
	# 	title = line.rstrip('\n')
	# 	award = {'award': title, 'nominees': []}
	# else:
	# 	nom = line.rstrip('\n')
	# 	nom = nom.split('-')
	# 	if len(nom) == 1: 
	# 		nommer = {'film': nom[0].strip(), 'nominee': ''}
	# 	else:
	# 		nommer = {'film': nom[1].strip(), 'nominee': nom[0].strip()}

	# 	award['nominees'].append(nommer)

# print(json.dumps(awards))
newOne.write(json.dumps(awards))