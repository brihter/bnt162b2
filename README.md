# bnt162b2

Reverse Engineering Source Code of the Biontech Pfizer Vaccine

https://berthub.eu/articles/posts/part-2-reverse-engineering-source-code-of-the-biontech-pfizer-vaccine/

## run

```
npm i
node index
```

## results

```
v1-nop: 27.63% match
v2    : 60.13% match
```

```
v1-nop - does nothing
v2     - tries to substitute the last nucleotide by either C or G while matching the aminoacid
```
