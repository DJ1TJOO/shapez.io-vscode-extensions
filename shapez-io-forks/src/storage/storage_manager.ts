export class StorageMananger {
    static forks: Array<any> = [];

    static setForks(forks: Array<any>): Array<any> {
        if (!Array.isArray(forks)) return this.forks;
        this.forks = forks;
        return this.forks;
    }
    static getForks(): Array<any> {
        return this.forks;
    }
    static addForks(forks: Array<any>): Array<any> {
        if (!Array.isArray(forks)) return this.forks;
        this.forks = [...this.forks, forks];
        return this.forks;
    }
    static async getForksFromRepo(
        repo: any,
        page: number = 1
    ): Promise<{ err: any; data: Array<any> }> {
        const promise = new Promise(
            (
                resolve: (value: { err: any; data: Array<any> }) => void,
                reject
            ) => {
                repo.forks(
                    { per_page: 100, page: page },
                    (err: any, body: any[], header: any) => {
                        if (err) return reject({ err: err, data: null });
                        if (typeof body === "undefined")
                            return resolve({ err: null, data: [] });

                        if (body.length > 99) {
                            this.getForksFromRepo(repo, page + 1)
                                .then(({ err, data }) => {
                                    resolve({
                                        err: null,
                                        data: [...body, ...data],
                                    });
                                })
                                .catch(({ err, data }) => {
                                    reject({ err: err, data: body });
                                });
                        } else resolve({ err: null, data: body });
                    }
                );
            }
        );
        return promise;
    }
}
