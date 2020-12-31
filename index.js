const fs = require('fs').promises
const _ = require('lodash')

const load = async (filename) => {
  const buffer = await fs.readFile(filename)
  let lines = buffer.toString().split('\n')
  lines.pop() // remove empty line

  let header = {}

  return lines
    .map((line, i) => {
      const parts = line.split(',')

      if (i === 0) {
        header = parts.reduce((acc, curr, ix) => {
          acc[ix] = curr
          return acc
        }, {})
        return 
      }

      return parts.reduce((acc, curr, ix) => {
        acc[header[ix]] = curr
        return acc
      }, {})
    })
    .filter(l => l !== undefined)
}

const runVersion = (versionFn, data) => {
  const input = _.cloneDeep(data.vaccine)
  return input.reduce((acc, curr) => {
    if (!curr) {
      return acc
    }

    acc.push(versionFn(curr, data))
    return acc
  }, [])
}

const v1 = (curr, data) => {
  return {
    abspos: curr.abspos,
    codonOrig: curr.codonOrig,
    codonVaccine: curr.codonOrig
  }
}

// it is known that a higher fraction of G and C characters improves the efficiency of an mRNA vaccine
const v2 = (curr, data) => {
  let vaccine = curr.codonOrig
  const amino = data.codon2amino[vaccine].aminoacid

  const candidate1 = vaccine.slice(0, -1) + 'G'
  if (data.codon2amino[candidate1].aminoacid === amino) {
    vaccine = candidate1
  }

  const candidate2 = vaccine.slice(0, -1) + 'C'
  if (data.codon2amino[candidate2].aminoacid === amino) {
    vaccine = candidate2
  }

  return {
    abspos: curr.abspos,
    codonOrig: curr.codonOrig,
    codonVaccine: vaccine
  }
}

const compare = ({ data, version, label }) => {
  const { vaccine } = data

  const originalLookup = vaccine.reduce((acc, curr) => {
    acc[curr.abspos] = curr
    return acc
  }, [])

  const versionLookup = version.reduce((acc, curr) => {
    acc[curr.abspos] = curr
    return acc
  }, [])

  let match = 0
  originalLookup.forEach(o => {
    if (o.codonVaccine === versionLookup[o.abspos].codonVaccine) {
      match++
    }
  })

  console.log(`${label}: ${_.round((match/(vaccine.length))*100, 2)}% match`)
}

const main = async () => {
  const vaccine = await load('side-by-side.csv')
  const aminoData = await load('codon-table-grouped.csv')

  const codon2amino = aminoData.reduce((acc, curr) => {
    acc[curr.codon] = curr
    return acc
  }, {})

  const amino2codon = aminoData.reduce((acc, curr) => {
    acc[curr.aminoacid] = curr
    return acc
  }, {})

  const data = {
    vaccine,
    codon2amino,
    amino2codon
  }

  compare({ label: 'v1-nop', data, version: runVersion(v1, data) })
  compare({ label: 'v2    ', data, version: runVersion(v2, data) })
}

main().catch(console.log)
